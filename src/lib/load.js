/**
 * 文件加载类
 * 部分方法借鉴自lufylegend的LoadManage(http://www.lufulegend.com)
 * create by Kong Yuehui
 * email:mail_yuehui@qq.com
 * 2015-02-06
 */

class kLoad{
    constructor(list, updateFn, completeFn){
        this.file_JS = "js";
        this.list = list, this.onupdate = updateFn, this.oncomplete = completeFn;
        this.loader = this, this.index = 0, this.loadIndex = 0, this.result = [], this.lresult = [];
        this.loadInit();
    }
    loadInit() {
        if (this.index >= this.list.length) {
            return;
        }
        this.loadIndex = 0;
        this.onupdate(0);
        this.loadFile();
    }
    loadFile() {
        let resObj, ext;
        if (this.loadIndex >= this.list.length) {
            return;
        }
        resObj = this.list[this.loadIndex];
        //console.info(resObj);
        if (!resObj.name) {
            resObj.name = "file" + this.loadIndex;
        }
        //console.info(resObj);
        if (!resObj["type"]) {
            ext = this.getExtension(resObj.path);
            if (new Array("jpg", "png", "bmp","jpeg").indexOf(ext) >= 0) {
                resObj.type = "image";
            } else if (ext == "js") {
                resObj["type"] = "js";
            } else if (new Array("mp3", "ogg", "wav", "m4a").indexOf(ext) >= 0) {
                resObj["type"] = "sound";
            }
        }
        switch (resObj.type) {
            case "image":
                this.loadImage(resObj);
                break;
            case "js":
                this.loadJs(resObj.path);
                break;
            case "sound":
                this.loadSound(resObj);
                break;
            default:
                console.info("不支持的格式");
                break;
        }
    }
    loadImage(resObj) {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        //console.info(fileUrl);
        image.onload = ()=> {
            var result = {};
            result[resObj.name] = image;
            this.result.push(result);
            this.fileLoadComplete();
        }
        image.src = resObj.path;
    }
    loadJs(fileUrl) {
        const script = document.createElement("script");
        script.onload = ()=> {
            this.fileLoadComplete();
        }
        script.type = "text/javascript";
        script.src = fileUrl;
        document.querySelector('head').appendChild(script);
    }
    loadSound(resObj) {
        const sound = document.createElement("audio");
        sound.onload = ()=> {
            this.fileLoadComplete();
        }
        sound.src = resObj.path;
    }
    fileLoadComplete() {
        this.loadIndex++;

        this.onupdate(parseInt(this.loadIndex / this.list.length*100));
        if (this.loadIndex == this.list.length) {
            this.allComplete();
        } else {
            this.loadFile();
        }
    }
    allComplete() {
        var reList = {};
        for (var i = 0; i < this.result.length; i++) {
            var item = this.result[i];
            for (var j in item) {
                reList[j] = item[j];
            }
        }
        this.oncomplete(reList);
    }
    /**
     * 根据路径获取到后缀名
     * @param  {string} path [url路径]
     */
    getExtension(path) {
        var result, pattern = /\.(.{3,4})$/g;
        result = path.match(pattern);
        //console.info(result);
        if (result && result.length >= 1) {
            return result[0].toLowerCase().replace(".","");
        }else{
            return null;
        }
    }
}

export default kLoad;