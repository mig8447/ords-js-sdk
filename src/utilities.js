/*! Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved */

export const jsonMimeTypeRegExp = /^application\/(?:[^\s+]+?[+])?json$/;
export const isJsonMimeType = pMimeType => jsonMimeTypeRegExp.test( pMimeType );
export const getStringTag = pObject => Object.prototype.toString.call( pObject );
export const isBlob = pObject => getStringTag( pObject ) === '[object Blob]';
export const asyncSleep = async pMilliseconds => {
    await new Promise( pResolve => setTimeout(
        pResolve,
        pMilliseconds
    ) );
};