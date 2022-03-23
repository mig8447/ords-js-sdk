/*! Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved */
/* global it describe */

import { expect } from '@esm-bundle/chai';
import { getStringTag, isJsonMimeType } from './utilities';

describe( 'Utilities', () => {
    describe( 'isJsonMimeType', () => {
        it ( 'returns true for standard JSON MIME (application/json)', () => {
            expect( isJsonMimeType( 'application/json' ) ).to.equal( true );
        } );
        it ( 'returns true for vendor JSON MIME (application/vnd.oracle+json)', () => {
            expect( isJsonMimeType( 'application/vnd.oracle+json' ) ).to.equal( true );
        } );
        it ( 'returns true for experimental JSON MIME (application/x.oracle+json)', () => {
            expect( isJsonMimeType( 'application/x.oracle+json' ) ).to.equal( true );
        } );
    } );

    describe( 'getStringTag', () => {
        it ( 'returns [object Object] for an empty object', () => {
            expect( getStringTag( {} ) ).to.equal( '[object Object]' );
        } );
        it ( 'returns [object Blob] for a Blob', () => {
            expect( getStringTag( new Blob() ) ).to.equal( '[object Blob]' );
        } );
    } );
} );