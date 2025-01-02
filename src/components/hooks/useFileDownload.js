import React from "react";


// Main component to handle file download
const useFileDownload = () => {
  
  // Utility function to decode base64 data
  const base64ToBlob = (base64Data, contentType) => {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
  
    return new Blob(byteArrays, { type: contentType });
  };

  // Determine the file extension based on content type
  const getFileExtension = (contentType) => {
    switch (contentType) {
      case "application/pdf":
        return ".pdf";
      case "application/msword":
        return ".doc";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return ".docx";
      case "text/html":
        return ".html";
      case "text/plain":
        return ".txt";
      default:
        return ".bin"; // for unknown file types
    }
  };

  const handleDownload = (dataUrl) => {
    // Extracting the content type and base64 data from the data URL
    const splitData = dataUrl.split(",");
    const contentType = splitData[0].split(":")[1].split(";")[0];
    const base64Data = splitData[1];

    const blob = base64ToBlob(base64Data, contentType);
    const fileExtension = getFileExtension(contentType);
    const fileName = `download${fileExtension}`;

    // Create a temporary link to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { handleDownload };
};

export default useFileDownload;