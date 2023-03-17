const video = document.getElementById('videoElm');

const loadFaceAPI = async () => {
    await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('./models')
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
    await faceapi.nets.faceExpressionNet.loadFromUri('./models');
}
function getCameraStream() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                video.srcObject = stream;
            });
    }
}

video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = {
        width:  video.videoWidth,
        height: video.videoHeight
    };
    setInterval( async () => {
       const detects =  await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
       const resizeDetects = faceapi.resizeResults(detects, displaySize);
       canvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
        faceapi.draw.drawDetections(canvas, resizeDetects);
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetects);
        faceapi.draw.drawFaceExpressions(canvas, resizeDetects);
    }, 300);
})

loadFaceAPI().then(getCameraStream);
const fetchPage = async (url) => {
    const res = await utils.fetchUrl(url);
    const html = res.data;
    const $ = cheerio.load(html);
    const listIdolSectionsDom = $('.shop-section  .portfolio .el');
    const listIdolUrls = [];
    listIdolSectionsDom.each(function () {
      let url = $(this).find('a').attr('href');
      listIdolUrls.push(domain + url);
    });
    for (const idolUrl of listIdolUrls) {
      const data = await fetchDetail(idolUrl);
      firebase.addData(data);
    }
    console.log('Done');
  };