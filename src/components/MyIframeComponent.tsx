import React, { useRef, useEffect } from 'react';

function MyIframeComponent(htmlContent: any) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`${htmlContent}`);
      iframeDoc.close();
    }
  }, []); // Run once on component mount

  return (
    <iframe
      ref={iframeRef}
      width="100%"
      height="600"
      allow="autoplay"
      title="Dynamic HTML"
    ></iframe>
  );
}

export default MyIframeComponent;