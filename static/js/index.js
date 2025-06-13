const ai = {
  data: function () {
    return {
      styleSelect: 1,
      codeSelect: 1,
      inputWord: "",
      isReset: false,
      canSend: true,
      answerWord: "",
      wordIndex: 0,
      answerInterval: null,
      content: [
        {
          question: "<span>测试一下</span>",
          answer:
            "<div>你好！我是XXXX，我会尽我所能为您提供帮助。</div><div style='margin-top: 10px;'>无论是<span style='font-weight: bold;'>信息查询</span>、<span style='font-weight: bold;'>对话交流</span>还是<span style='font-weight: bold;'>其他问题</span>，我都会认真对待。</div><div style='margin-top: 10px;'>请问有什么可以帮您的？</div>",
        },
      ],
      code: 'import datetime\n\nprint("Today is:", datetime.date.today())',
      fileType: 1, // 1-图片 2-文件
      uploadFiles: [],
      uploadImgs: [],
      codeShowStatus: 0, // 0-显示无动画 文字为隐藏 1-隐藏动画 文字为显示 2- 显示动画 文字为隐藏
    };
  },
  methods: {
    /**
     * rem適配
     */
    resizeRoot() {
      var scale = 1 / devicePixelRatio;
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute(
          "content",
          "initial-scale=" +
            scale +
            ", maximum-scale=" +
            scale +
            ", minimum-scale=" +
            scale +
            ", user-scalable=no"
        );
      document.documentElement.style.fontSize =
        (document.documentElement.clientWidth / 1440) * 50 + "px";
    },
    changeStyleSelect(index) {
      this.styleSelect = index;
    },
    changeCodeSelect(index) {
      this.codeSelect = index;
      if (index == 1) {
        this.code =
          'import datetime\n\nprint("Today is:", datetime.date.today())';
      } else {
        this.code = '#!/bin/bash\necho "Today is: $(date +%Y-%m-%d)"';
      }
    },
    changeReset() {
      this.isReset = true;
      this.content = [];
      setTimeout(() => {
        this.isReset = false;
      }, 500);
    },
    reset() {
      this.content = [];
    },
    handleKey(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    },
    send() {
      if (
        this.inputWord == "" &&
        this.uploadFiles.length == 0 &&
        this.uploadImgs.length == 0
      )
        return;
      //
      let lastInput = this.inputWord.replace(/\n/g, "<br>");
      //   拼接图片
      let imgsHtml = "";
      if (this.uploadImgs.length > 0) {
        this.uploadImgs.forEach((item) => {
          imgsHtml += `<img src="${item.url}"/ style="width: 1.5rem; height: 1.5rem; object-fit: contain">`;
        });
      }
      lastInput =
        `<div
                style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.2rem;
                  justify-content: flex-end;
                  margin-bottom:0.1rem;
                "
              >` +
        imgsHtml +
        `</div>` +
        lastInput;
      //   拼接文件
      if (this.uploadFiles.length > 0) {
        lastInput += `<div
                style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.2rem;
                  justify-content: flex-end;
                  margin-bottom:0.1rem;
                "
              >`;
        this.uploadFiles.forEach((item) => {
          lastInput += `<section class="file-box">
                <div class="left-type-img ${
                  item.typeName == "pdf" ? "pdf" : "exc"
                }"></div>
                <div class="right-info">
                  <div class="name">${item.name}</div>
                  <div class="size">
                    ${item.typeName} | ${item.size}
                  </div>
                </div>
              </section>`;
        });
        lastInput += `</div>`;
      }
      this.content.push({
        question: lastInput,
        answer:
          "<div class='dot-loading'><span>.</span><span>.</span><span>.</span></div>",
      });
      // 此处以后为实际api对接逻辑
      this.answerWord = "由于未对接后端服务，暂时无法回答你的问题。";
      setTimeout(() => {
        this.answerInterval = setInterval(() => {
          this.wordIndex++;
          this.content.at(-1).answer = this.answerWord.slice(0, this.wordIndex);
          if (this.wordIndex == this.answerWord.length) {
            this.wordIndex = 0;
            clearInterval(this.answerInterval);
          }
        }, 50);
      }, 1000);
      this.inputWord = "";
      this.uploadFiles = [];
      this.uploadImgs = [];
      this.$nextTick(() => {
        this.$refs.communicationWrap.scrollTop =
          this.$refs.communicationWrap.scrollHeight;
      });
    },
    copy() {
      navigator.clipboard.writeText(this.code);
      // .then(() => alert("复制成功"))
      // .catch(() => alert("复制失败"));
    },
    uploadImg(e) {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (this.fileType == 2) this.uploadFiles = [];
        this.fileType = 1;
        this.uploadImgs.push({
          url: reader.result,
        });
        e.target.value = "";
      };
    },
    uploadFile(e) {
      let file = e.target.files[0];
      if (this.fileType == 1) this.uploadImgs = [];
      this.fileType = 2;
      this.uploadFiles.push({
        typeName: this.getFileTypeName(file.type),
        typeLogo: 1,
        name: file.name,
        size: this.formatFileSize(file.size),
      });
      e.target.value = "";
    },
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    },
    getFileTypeName(mimeType) {
      const typeMap = {
        "application/pdf": "pdf",
        "application/msword": "word",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "word",
        "application/vnd.ms-excel": "excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "excel",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          "ppt",
        "image/jpeg": "image",
        "image/png": "image",
        "image/gif": "image",
        "image/webp": "image",
        "video/mp4": "video",
        "audio/mpeg": "audio",
        "text/plain": "txt",
        "application/zip": "archive",
        "application/x-rar-compressed": "archive",
      };

      return typeMap[mimeType] || "unknown";
    },
    deleteFile(index) {
      this.uploadFiles.splice(index, 1);
    },
    deleteImg(index) {
      this.uploadImgs.splice(index, 1);
    },
    triggerImgUploadBtn() {
      this.$refs.imgUpload.click();
    },
    triggerFileUploadBtn() {
      this.$refs.fileUpload.click();
    },
    changeCodeShowStatus() {
      let statusAry = [1, 2, 1];
      this.codeShowStatus = statusAry[this.codeShowStatus];
    },
  },
  mounted() {
    let _this = this;
    // 頁面size初始化
    _this.resizeRoot();
    window.onresize = function () {
      _this.resizeRoot();
    };
  },
};
let app = Vue.createApp(ai).mount("#ai");
