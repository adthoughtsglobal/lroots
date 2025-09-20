let currentNodePath = [];
let currentXML = null;
let currentBaseURL = null;
let notEntered = true;

function getBaseURL(url) {
    const baseUrl = new URL(url);
    return baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/'));
}

function LoadUpURL(url = "../demo/main.xml?node=hello") {
    if (document.getElementById("url_input").value == url && notEntered)
        return
    console.log(" XML:", url);
    document.getElementById("url_input").value = url;
    const urlObj = new URL(url, window.location.href);
    const nodeParam = new URLSearchParams(urlObj.search).get("node");

    if (!nodeParam) {

    };

    if (currentNodePath.join('/') === nodeParam) {
        loadFromCache();
        return;
    }

    currentBaseURL = urlObj.origin + urlObj.pathname;
    currentNodePath = nodeParam ? nodeParam.split('/') : [];

    loadBackBtn();
    fetchXML(url);
}

function fetchXML(url) {
    fetch(url)
        .then(response => response.text())
        .then(xml => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "application/xml");

            currentXML = xmlDoc;

            processNode(xmlDoc);
        })
        .catch(error => {
            console.error("Error loading XML:", error);
        });
}

function processNode(xmlDoc) {
    let currentNode;
    if (!currentNodePath || currentNodePath.length === 0) {
        currentNode = xmlDoc.querySelector("node");
    } else {
        currentNode = xmlDoc;
        for (let path of currentNodePath) {
    currentNode = currentNode.querySelector(`node[title="${path}"], node[id="${path}"]`);
    if (!currentNode) return;
}

    }
    if (currentNode) renderNode(currentNode);
}


function renderNode(currentNode) {
    const title = currentNode.getAttribute("title") || currentNodePath;
    const content = currentNode.querySelector("data") ? currentNode.querySelector("data").textContent : "";

    document.querySelector("#primary_heading").textContent = title;
    document.querySelector("#primary_p").textContent = content;

    const pathLogs = document.querySelector("#path_logs");
    const pathElement = document.createElement("p");
    pathElement.classList.add("singular_path");

    const fullPath = currentNodePath.join('/');
    pathElement.dataset.baseurl = currentBaseURL;
    pathElement.dataset.nodepath = fullPath;

    const newURL = `${pathElement.dataset.baseurl}?node=${encodeURIComponent(pathElement.dataset.nodepath)}`;
    pathElement.onclick = () => {
        LoadUpURL(newURL);
    };

    const titleSpan = document.createElement("span");
    titleSpan.classList.add("title");
    titleSpan.textContent = fullPath;
    const urlSpan = document.createElement("span");
    urlSpan.classList.add("url");
    urlSpan.textContent = newURL.split("?")[0];


    pathElement.appendChild(titleSpan);
    pathElement.appendChild(urlSpan);
    pathLogs.appendChild(pathElement);
    document.getElementById('path_logs').scrollTop = document.getElementById('path_logs').scrollHeight;

const subnodes = currentNode.querySelectorAll(":scope > node");

    displaySubNodeLinks(subnodes);
}

function displaySubNodeLinks(subnodes) {
    document.getElementById("sublinks").innerHTML = '';
    subnodes.forEach((subnode, index) => {
        const title = subnode.getAttribute("title");
        const src = subnode.getAttribute("src");

        const link = document.createElement("div");
        link.classList.add("sing_sub_link");

        console.log(src, title)
        if (src) {
            link.onclick = () => {
                const newURL = src.includes("://") ? src : `${getBaseURL(currentBaseURL)}/${src}`;
                console.log(newURL)
                LoadUpURL(newURL);
            };
        } else {
            link.onclick = () => {
                const newPath = [...currentNodePath, title].join('/');
                const newURL = `${currentBaseURL}?node=${encodeURIComponent(newPath)}`;
                LoadUpURL(newURL);
            };
        }

        link.innerHTML = `
            <div class="subl_tit">${title}</div>
            <div class="subl_ic msr">chevron_forward</div>
        `;
        document.getElementById("sublinks").appendChild(link);
    });
}


LoadUpURL();


function loadFromCache() {
    if (!currentXML) return;

    let currentNode = currentXML;
    for (let path of currentNodePath) {
        currentNode = currentNode.querySelector(`node[title="${path}"], node[id="${path}"]`);
        if (!currentNode) return;
    }

    renderNode(currentNode);
}


document.getElementById("url_input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
        notEntered = false;
        LoadUpURL(document.getElementById("url_input").value);
        notEntered = true;
    };
});

function goBack(btn) {
    const newPath = currentNodePath.slice(0, currentNodePath.length - 1).join('/');
    if (!newPath) {
        loadBackBtn();
    }
    const newURL = `${currentBaseURL}?node=${encodeURIComponent(newPath)}`;
    LoadUpURL(newURL);
}

function loadBackBtn() {
    const btn = document.getElementById('backbtn');
    if (currentNodePath.length <= 1) {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = 0.2;
    } else {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = .7;
    }
}

let hoverTimer;

const pathLogs = document.querySelector('#path_logs');

pathLogs.addEventListener('mouseleave', () => {
  hoverTimer = setTimeout(() => {
    pathLogs.scrollTo({ top: pathLogs.scrollHeight, behavior: 'smooth' });
  }, 300);
});

pathLogs.addEventListener('mouseenter', () => {
  clearTimeout(hoverTimer);
});
