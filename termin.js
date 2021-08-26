// const { exec } = require("child_process");
// const config = require('./config.json');

// // const file1path = ' /home/vagif/Desktop/TLC00000.AVI'

// const getVideoMetaData = () => {

// exec(`exiftool -j ${config.VIDEO_INPUTS_PARAMS.file}`, (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`FileModifyDate: ${JSON.stringify(JSON.parse(stdout)[0]['FileModifyDate'])}`)
//     console.log(`FileAccessDate: ${JSON.stringify(JSON.parse(stdout)[0]['FileAccessDate'])}`)
//     console.log(`Duration: ${JSON.stringify(JSON.parse(stdout)[0]['Duration'])}`)


// });
// }
var dialog = require('dialog');
 
dialog.info('Hello there');

// const aviToMp4 = () => {
//     if (config.VIDEO_INPUTS_PARAMS.file.toLowerCase().includes('.avi')) {
//         const newFilePath = `${config.VIDEO_INPUTS_PARAMS.file.replace('.avi','')}_compressed.mp4`
//         exec(`ffmpeg -i ${config.VIDEO_INPUTS_PARAMS.file} -codec copy ${newFilePath}`, (error, stdout, stderr) => {
//             if (error) {
//                 console.log(`error: ${error.message}`);
//                 return;
//             }
//             if (stderr) {
//                 console.log(`stderr: ${stderr}`);
//                 return;
//             }
//             console.log(`${stdout}`)
        
        
//         });
//     }
// }

// getVideoMetaData()
// // aviToMp4()