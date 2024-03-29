function loadXMLDoc(filename) {
    if (window.ActiveXObject) {
        xhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        xhttp = new XMLHttpRequest();
    }
    xhttp.open("GET", filename, false);
    xhttp.send("");
    return xhttp.responseXML;
}

<!-- Preisdaten drucken-->

<!-- Important: the FO to PDF feature won't work when being disconnected from the hslu network -->
async function createPdf() {
    // xsl transformation
    let xml = loadXMLDoc('../fo.xml') // load xml file, change file name in own project
    let xsl = loadXMLDoc('../preisdatenDrucken/fo.xsl') // load xsl file, change file name in own project

    /* XSLT Transformation*/
    xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    resultDocument = xsltProcessor.transformToFragment(xml, document); // different in video "transformToDocument"

    const serializer = new XMLSerializer();
    const document_fragment_string = serializer.serializeToString(resultDocument);

    // send transformed xml (fo) to backend for api request
    const response = await fetch('/convertToPdf', {
        method: 'POST',
        body: document_fragment_string // different in video "foToDocumentString"
    })

    /* returns rendered PDF */
    // if request ok -> download pdf-file
    if (response.status === 200) {
        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const link = document.getElementById('dummyLink')
        link.href = window.URL.createObjectURL(blob);
        link.download = "Preisstatistik_Energiewerke.pdf";
        link.click()
    }
}
