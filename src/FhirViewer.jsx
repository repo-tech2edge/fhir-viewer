import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FhirResource, fhirVersions, fhirIcons } from 'fhir-react';

import 'fhir-react/build/style.css';
import 'fhir-react/build/bootstrap-reboot.min.css';


const FhirViewer = () => {
  const [fhirResource, setFhirResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [downloadableItems,setDownloadableItems] = useState([]);
  // Default file path
  const defaultFilePath = './src/data/fhirResource.json';

  const downloadBinaryAsPdf = (base64Data, fileName) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
  
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'file.pdf'; // You can specify a fileName if needed
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  // Function to get the file path from the query string
  const getFilePathFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('filePath') || defaultFilePath;
  };

  const filePath = getFilePathFromQuery();

  const modifiedResource = (data) => {

    //binary
    if (data && data.entry && Array.isArray(data.entry)) {
      data.entry = data.entry.map(entry => {
        if (entry.resource && entry.resource.resourceType === 'Binary') {
          
          const downloadableItem = {
            title: 'Binary File',
            url: `download-binary-file/${entry.fullUrl}`,
            data: entry.resource.data || ""
          };
          setDownloadableItems(prevItems => [...prevItems, downloadableItem]);

          return {
            ...entry,
            resource: {
              ...entry.resource,
              resourceType: 'Downloadable',              
            }
          };
        }

       
        return entry;
      });
    }

    //document reference
    if (data && data.entry && Array.isArray(data.entry)) {
      data.entry = data.entry.map(entry => {
        if (entry.resource && entry.resource.resourceType === 'DocumentReference') {
          const downloadableItem = {
            title: 'DocumentReference File',
            url: `download-binary-file/${entry.fullUrl}`,
            data: entry.resource.content[0].attachment.data || ""
          };
          setDownloadableItems(prevItems => [...prevItems, downloadableItem]);

          return {
            ...entry,
            resource: {
              ...entry.resource,
              resourceType: 'Downloadable',              
            }
          };
        }

       
        return entry;
      });
    }
    return data;
  };
  const handleDownload = (item) => {
    console.log(item);
    if (item.data) {
      downloadBinaryAsPdf(item.data, item.title);
    } else {
      window.open(item.url, '_blank');
    }
  };


  useEffect(() => {
    if (filePath) {
      // Fetch the JSON file from the specified path
      axios.get(filePath)
        .then((response) => {
          
          setFhirResource(modifiedResource(response.data));
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    } else {
      setError(new Error("No file path provided"));
      setLoading(false);
    }
  }, [filePath]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
const a = () => { console.log("Hello") }
  if(fhirResource){
    return (
      <>
        <FhirResource
          fhirResource={fhirResource}
          fhirVersion={fhirVersions.R4}
          fhirIcons={fhirIcons}
          withCarinBBProfile={false}
          customId="aaa"
        />
        {downloadableItems.length > 0 && (
          <div className="mt-4 container card card-body">
            <h3 className="mb-3">Downloadable Items:</h3>
            <ul className="list-group">
              {downloadableItems.map((item, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{item.title}</span>
                  <button className="btn btn-link bi bi-download" onClick={() => handleDownload(item)}>Download</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }else{
    return <>Wait</>
  }
};

export default FhirViewer;
