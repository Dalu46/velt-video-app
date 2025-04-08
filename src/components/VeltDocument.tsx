'use client'
import {  useSetDocumentId, VeltCommentTool, VeltPresence } from '@veltdev/react';
import { useEffect, useState } from 'react';

export default function YourDocument() {

  useSetDocumentId('my-document-id')

  return (
    <div>
      <VeltCommentTool/>
    </div>
    
  );
}