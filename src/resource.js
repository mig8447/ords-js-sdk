/*! Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved */

import { isJsonMimeType, isBlob } from './utilities';

export class ORDSResource {
    constructor ( pUrl, pOptions ) {
        const lOptions = {
            offset: 0,
            limit: null,
            baseUrl: null,
            authentication: {
                clientId: null,
                clientSecret: null
            },
            ...pOptions,
            fetchOptions: {
                method: 'GET',
                ...pOptions?.fetchOptions,
                headers: {
                    accept: 'application/json',
                    ...pOptions?.fetchOptions?.headers
                }
            }
        };
        this._options = lOptions;
        
        this._class = Object.getPrototypeOf( this ).constructor;

        
        this._url = new URL( this._options.baseUrl ? this._options.baseUrl + pUrl : pUrl );

        // Remove any parameters in the URL
        this._url.search = '';

        this._initialUrl = new URL( this.url );

        

        this._type = null;
        this._limit = lOptions.limit || null;
        this._offset = lOptions.offset || null;
        this._hasMore = null;

        this._baseUrl = lOptions.baseUrl || null;

        this._authentication = lOptions.authentication || null;

        this._updateUrlSearchParameters();

        this._filters = {};
    }
    get url() {
        return this._url.href;
    }
    get hasData() {
        return typeof this._data !== 'undefined' && this.data !== null;
    }
    get data() {
        this._throwIfNoData();
        return this._data;
    }
    get binaryData() {
        this._throwIfNoData();
        return this._binaryData;
    }
    get jsonData() {
        this._throwIfNoData();
        return this._jsonData;
    }
    get limit() {
        return this._limit;
    }
    get offset() {
        return this._offset;
    }
    get baseUrl() {
        return this._baseUrl;
    }
    get hasMore() {
        return this._hasMore;
    }
    get isCollection() {
        this._throwIfNoData();
        return this._type === this._class.type.COLLECTION;
    }
    get isItem() {
        this._throwIfNoData();
        return this._type === this._class.type.ITEM;
    }
    get isMedia() {
        this._throwIfNoData();
        return this._type === this._class.type.MEDIA;
    }
    get isOther() {
        this._throwIfNoData();
        return this._type === this._class.type.OTHER;
    }

    addFilter( pField, pOperator, pValue ) {
        this._filters[ pField ] = { operator: pValue };
    }

    _throwIfNoData(){
        if ( !this._data ) {
            throw new Error( 'ORDSResource: No data available in the resource. Have you made a request?' );
        }
    }
    _throwIfNoJsonData(){
        this._throwIfNoData();
        if ( !this._jsonData ) {
            throw new Error( 'ORDSResource: No JSON data available in the resource' );
        }
    }
    _throwIfNotCollection(){
        if ( !this.isCollection ) {
            throw new Error( 'ORDSResource: The current resource is not a COLLECTION type resource' );
        }
    }
    _throwIfNotItem(){
        if ( !this.isItem() ) {
            throw new Error( 'ORDSResource: The current resource is not a ITEM type resource' );
        }
    }
    _updateUrlSearchParameters(){
        if ( this._limit ) {
            this._url.searchParams.set( 'limit', this._limit );
        } else {
            this._url.searchParams.delete( 'limit' );
        }
        if ( this._offset ) {
            this._url.searchParams.set( 'offset', this._offset );
        } else {
            this._url.searchParams.delete( 'offset' );
        }
    }

    _discoverType(){
        this._throwIfNoData();
        const lData = this._data;
        if ( isBlob( lData ) ) {
            this._type = this._class.type.MEDIA;
            return;
        }
        if (
            Array.isArray( lData.items )
            && ( 'limit' in lData )
            && ( 'offset' in lData )
            && ( 'hasMore' in lData )
            && ( 'links' in lData )
        ) {
            this._type = this._class.type.COLLECTION;
            return;
        }
        if ( Array.isArray( lData.links ) && lData.links.find(
            pLink => pLink.href && pLink.rel === 'collection'
        ) ) {
            this._type = this._class.type.ITEM;
            return;
        }

        this._type = this._class.type.OTHER;
    }
    _discoverPagination(){
        this._throwIfNoJsonData();
        if ( this._type !== ORDSResource.type.COLLECTION ) return;
        const lData = this._jsonData;
        this._limit = lData.limit;
        this._offset = lData.offset;
        this._hasMore = lData.hasMore;

    }
    _discoverLinks(){
        this._throwIfNoJsonData();
        const lData = this._jsonData;
        if ( !lData.links || !Array.isArray( lData.links ) || !lData.links.length ) {
            this._links = {};
            return;
        }
        this._links = lData.links.reduce( ( pAccumulator, pLink ) => {
            if ( !pLink.rel || !pLink.href ) return pAccumulator;
            if ( pLink.rel in pAccumulator ) {
                pAccumulator[ pLink.rel ].push( pLink.href );
                return pAccumulator;
            }
            pAccumulator[ pLink.rel ] = [ pLink.href ];
            return pAccumulator;
        }, {} );
    }

    async _getAuthenticationToken(){
        if(this._options.authentication.clientId === null || this._options.authentication.clientSecret === null || this._options.baseUrl === null) return;
        // Hacer fetch, no olvidar await
        let url = this._options.baseUrl;
        url += 'oauth/token';

        const clientToBase64 = btoa(this._options.authentication.clientId+':'+this._options.authentication.clientSecret);

        const token = (await fetch(url, {
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${clientToBase64}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST'
        })
            .then(response => response.json())).access_token;
        


        this._options.fetchOptions.headers = {
            ...this._options.fetchOptions.headers, 
            'Authorization': `Bearer ${token}`
        };


    }

    async makeRequest() {
        // TODO: Maybe make a HEAD before
        // TODO: What happens with CORS?
        await this._getAuthenticationToken();
        const lResponse = await fetch( this.url, this._options.fetchOptions );
        const lMimeType = lResponse.headers.get( 'Content-Type' );
        const lIsJson = isJsonMimeType( lMimeType );
        if ( !lResponse.ok ) {
            const lErrorBody = lIsJson ? `\n${ await lResponse.text() }\n` : '';
            throw new Error( `ORDSResource: Resource request failed with status code "${ lResponse.status }"${ lErrorBody }` );
        }

        if ( !lIsJson ) {
            this._data = await lResponse.blob();
            this._binaryData = this._data;
            // TODO: Decide how to handle non-json media
            return;
        }

        this._data = await lResponse.json();
        this._jsonData = this._data;

        this._discoverType();
        this._discoverPagination();
        this._discoverLinks();
    }
    async requestNextPage(){
        this._throwIfNoData();
        this._throwIfNotCollection();

        if ( !this.hasMore ) {
            console.warn( 'ORDSResource: Resource does not have more pages' );
            return false;
        }

        const lNextUrl = this._links?.next?.[ 0 ];
        if ( !lNextUrl ) {
            throw new Error( 'ORDSResource: Data does not contain a "next" link reference' );
        }

        this._url = new URL( lNextUrl );
        await this.makeRequest();
    }
}
ORDSResource.version = import.meta.env.SNOWPACK_PUBLIC_VERSION;
ORDSResource.type = {
    /** A json/collection resource */
    COLLECTION: 'COLLECTION',
    /** A json/item resource */
    ITEM: 'ITEM',
    /** A non-JSON resource */
    MEDIA: 'MEDIA',
    /** A JSON resource with limited support */
    OTHER: 'OTHER'
};
Object.seal( ORDSResource.type );
ORDSResource.operator = {
    /** To filter the values in a column that are equal to a value */
    EQUALS: '$eq',
    /** To filter the values in a column that are greater than a value */
    GREATER_THAN: '$gt',
    /** To filter the values in a column that are lesser than a value */
    LESS_THAN: '$lt',
    /** To filter the values in a column that are different from a value */
    NOT_EQUALS: '$ne',
    /** To filter the values in a column that are contained in a string value */
    IN_STRING: '$instr',
    /** To filter the values in a column that match a SQL LIKE expression in a string value */
    LIKE: '$like'
};
