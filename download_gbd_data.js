(async () => {
    /* Grab every “Download” link on the page ------------------------- */
    const links = [
      ...document.querySelectorAll('a.ant-btn[href$=".zip"]')
    ].map(a => a.href);
  
    console.log(`Found ${links.length} files…`);
  
    /* Helper: download one file, keeping your cookies for auth ------- */
    const downloadFile = async url => {
      const resp  = await fetch(url, { credentials: 'include' });
      const blob  = await resp.blob();
  
      /* Derive a filename from the URL */
      const file  = url.split('/').pop();
      const anchor = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: file,
      });
      anchor.click();
      URL.revokeObjectURL(anchor.href);
      console.log(`✓ ${file}`);
    };
  
    /* Fetch sequentially so you don’t spam the server ---------------- */
    for (const url of links) {
      await downloadFile(url);
    }
  
    console.log('🎉  All done!');
  })();