const fs = require('fs')
const { tmpdir } = require("os")
const Crypto = require("crypto")
const ff = require('fluent-ffmpeg')
const webp = require("node-webpmux")
const path = require("path")
const axios = require('axios')
const BodyForm = require('form-data')
const { fromBuffer } = require('file-type')

async function imageToWebp(media) {

    const tmpFileOut = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    const tmpFileIn = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`

    fs.writeFileSync(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    fs.unlinkSync(tmpFileOut)
    fs.unlinkSync(tmpFileIn)
    return buff
}

async function videoToWebp (media) {

    const tmpFileOut = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    const tmpFileIn = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`

    fs.writeFileSync(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00",
                "-t",
                "00:00:05",
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    fs.unlinkSync(tmpFileOut)
    fs.unlinkSync(tmpFileIn)
    return buff
}

async function writeExifImg (media, metadata) {
    let wMedia = await imageToWebp(media)
    const tmpFileIn = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    const tmpFileOut = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    fs.writeFileSync(tmpFileIn, wMedia)

    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { "sticker-pack-id": `https://github.com/rtwone/chitandabot`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut
    }
}

async function writeExifVid (media, metadata) {
    let wMedia = await videoToWebp(media)
    const tmpFileIn = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    const tmpFileOut = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    fs.writeFileSync(tmpFileIn, wMedia)

    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { "sticker-pack-id": `https://github.com/rtwone/chitandabot`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut
    }
}

async function writeExif (media, metadata) {
    let wMedia = /webp/.test(media.mimetype) ? media.data : /image/.test(media.mimetype) ? await imageToWebp(media.data) : /video/.test(media.mimetype) ? await videoToWebp(media.data) : ""
    const tmpFileIn = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    const tmpFileOut = `./gambar/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    fs.writeFileSync(tmpFileIn, wMedia)

    if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = { "sticker-pack-id": `https://github.com/rtwone/chitandabot`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)
        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)
        return tmpFileOut
    }
}

function TelegraPh(path) {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(path)) return reject(new Error("File not Found"))
		try {
		let buffer = fs.readFileSync(path)
        const { ext } = await fromBuffer(buffer)
        const fd = new BodyForm()
        fd.append('fileToUpload', buffer, new Date() * 1 + '.' + ext)
        fd.append('reqtype', 'fileupload')

        const { data } = await axios.post('https://catbox.moe/user/api.php', fd, {
          headers: fd.getHeaders(),
        });
        resolve(data?.trim() || 'failed')
       } catch (e) {
        console.error(e)
        reject(`Upload error: ${e.message}`)
      }
	})
}
async function UploadFileUgu (input) {
	return new Promise (async (resolve, reject) => {
			const form = new BodyForm();
			form.append("files[]", fs.createReadStream(input))
			await axios({
				url: "https://uguu.se/upload.php",
				method: "POST",
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
					...form.getHeaders()
				},
				data: form
			}).then((data) => {
				resolve(data.data.files[0])
			}).catch((err) => reject(err))
	})
}
module.exports = { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif, TelegraPh, UploadFileUgu }