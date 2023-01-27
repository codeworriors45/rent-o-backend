const getNextLink = (initPath, obj) => {
    let link = initPath;
    const { page, ...rest } = obj;
    let tempPage = page ? page : 1;
    Object.entries(rest).map(([key,value])=>{
        link = link + `${value ? `${key}=${value}&`: '' }`
    })
    link = link + `${tempPage ? `page=${parseInt(tempPage)+1}`: '' }`

    return link;
}

const getPrevLink = (initPath, obj) => {
    let link = initPath;
    const { page, ...rest } = obj;
    let tempPage = page ? page : 1;
    Object.entries(rest).map(([key,value])=>{
        link = link + `${value ? `${key}=${value}&`: '' }`
    })
    link = link + `${tempPage ? `page=${parseInt(tempPage)-1}`: '' }`
    
    return link;
}

const linkGenerator = (total, initPath, obj) => {
    let tempPage = obj.page ? obj.page  : 1;
    let tempLimit = obj.limit ? obj.limit : 10;

    let prevURL;
    let nextURL;
    
    if(tempPage == 1 && parseInt(total) <= parseInt(tempLimit)){
        prevURL = '';
        nextURL = '';
    }
    else if(tempPage==1 && parseInt(total) > parseInt(tempLimit)){
        prevURL = '';
        nextURL = getNextLink(initPath, obj);
    }
    else if(tempPage==(Math.ceil(parseInt(total)/parseInt(tempLimit)))){
        prevURL = getPrevLink(initPath, obj);
        nextURL = '';
    }
    else if(tempPage>1){
        prevURL = getPrevLink(initPath, obj);

        nextURL = getNextLink(initPath, obj);
    }

    const data = {
        prevURL,
        nextURL
    }

    return data ;
}

module.exports = linkGenerator;