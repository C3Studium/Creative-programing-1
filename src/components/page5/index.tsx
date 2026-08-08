// Leasson 2

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const degToRad = (degree: number) => {
    return degree * Math.PI / 180;
}

const mapRange = (
    value: number,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number,
    clamped?: boolean,
    clamp = true
): number => {
    let mapped = outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)

    if (clamp) {
        const minOut = Math.min(outputMin, outputMax)
        const maxOut = Math.max(outputMin, outputMax)
        mapped = Math.max(minOut, Math.min(maxOut, mapped))
    }

    return mapped
}


export default function Page5() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const typeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const typeContextRef = useRef<CanvasRenderingContext2D | null>(null);
    // @ts-ignore — loaded client-side only inside canvas-sketch's useEffect
    const TweakPage = require("tweakpane");
    const random = require("canvas-sketch-util/random");


    const width = 1080;
    const height = 1080;

    const settings = {
        dimensions: [width, height],
        canvas: canvasRef.current,
        animate: false,
        hotkeys: false,
    }



    // const animate = () => {
    //     console.log("domestika")
    //     requestAnimationFrame(animate);
    // }

    const params = {

    }

    const createPane = () => {
        const pane = new TweakPage.Pane();
        let folder;


    }

    const getGlyph = (v: number) => {
        const glyphs = " .:-=+*".split("")
        if (v < 50) return ""
        if (v < 100) return "."
        if (v < 150) return "-"
        if (v < 200) return "+"
        if (v < 250) return "="

        return random.pick(glyphs)
    }

    let text = "A"
    let fontSize = "2000px";
    let font = 'Helvetica Neue';
    let fontStyle = "normal";
    let fontWeight = 600


    const sketch = () => {
        const typeCanvas = typeCanvasRef.current
        const typeContext = typeContextRef.current
        if (!typeCanvas || !typeContext) return;

        const cells = 25;
        const cols = Math.floor(width / cells)
        const rows = Math.floor(height / cells)
        const numcells = rows * cols;

        typeCanvas.width = cols;
        typeCanvas.height = rows;



        return ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }) => {
            typeContext.fillStyle = "black";
            typeContext.fillRect(0, 0, cols, rows);
            context.fillStyle = "black";
            context.fillRect(0, 0, width, height);

            context.drawImage(typeCanvas, 0, 0, width, height)
            // fonts are complex shapes, not often they are automatically centered by the canvas translate, nor align center, we need to use the exact width of the text using other props like text metrics 

            fontSize = `${cols}px`
            typeContext.fillStyle = "white";
            typeContext.font = `${fontStyle} ${fontWeight} ${fontSize} ${font}`;
            typeContext.textBaseline = "top";
            // typeContext.textAlign = "center";

            // lets use font metrics to determine the correct positon of the letter

            const metrics = typeContext.measureText(text)

            const mx = metrics.actualBoundingBoxLeft * -1
            const my = metrics.actualBoundingBoxAscent * -1
            const mW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
            const mH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

            const x = (cols - mW) * 0.5 - mx;
            const y = (rows - mH) * 0.5 - my;

            typeContext.save();
            typeContext.translate(x, y)
            typeContext.beginPath()
            typeContext.rect(mx, my, mW, mH)
            // typeContext.translate(width * 0.5, height * 0.5);
            typeContext.fillText(text, 0, 0);
            typeContext.restore();



            const TypeData = typeContext.getImageData(0, 0, cols, rows).data;

            for (let i = 0; i < numcells; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const r = TypeData[i * 4 + 0];
                const g = TypeData[i * 4 + 1];
                const b = TypeData[i * 4 + 2];
                const a = TypeData[i * 4 + 3];

                const glyph = getGlyph(r)

                // console.log(r, g, b, a)

                const x = col * cells;
                const y = row * cells;

                // context.fillStyle = `rgb(${r}, ${g}, ${b})`
                context.fillStyle = "white"

                let fs = 1


                context.textAlign = "center"
                context.textBaseline = "middle"
                context.save();
                context.translate(x, y);
                context.translate(cells * 0.5, cells * 0.5)
                context.font = `100 ${cells * 2.5}px ${font}`
                if (Math.random() < 0.1) { context.font = `50 ${cells * mapRange(fs, 0, 0.5, 2, 6)}px ${font}` }
                context.fillText(glyph, 0, 0)
                // context.fillRect(0, 0, cells, cells);
                context.restore();

            }
        };
    };


    useEffect(() => {
        let isMounted = true;
        let manager: any = null;
        let typeManager: any = null;

        typeCanvasRef.current = document.createElement("canvas");
        typeContextRef.current = typeCanvasRef.current.getContext("2d");

        if (!typeContextRef.current) return;

        // --- MediaRecorder State variables ---
        let mediaRecorder: MediaRecorder | null = null;
        let recordedChunks: Blob[] = [];


        const InitSketch = async () => {
            // @ts-ignore
            const canvasSketchModule = require("canvas-sketch");
            const canvasSketch = canvasSketchModule.default || canvasSketchModule;

            if (!canvasRef.current || !isMounted) return

            const finalSetting = {
                ...settings,
                canvas: canvasRef.current
            }

            try {
                const m = await canvasSketch(sketch, finalSetting);
                if (!isMounted) {
                    m.unload();
                } else {
                    manager = m;
                }
            } catch (error) {
                console.log(error)
            }
            createPane();
            canvasRef.current.focus();
        }

        // --- Pre-load ffmpeg once so conversion is fast when recording stops ---
        let ffmpeg: any = null;
        const initFFmpeg = async () => {
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            ffmpeg = new FFmpeg();
            await ffmpeg.load();
            console.log("✅ ffmpeg ready");
        };
        initFFmpeg();

        InitSketch()

        const update = async () => {


        }
        const onKeyUp = (e: KeyboardEvent) => {
            text = e.key.toLocaleUpperCase()
            manager.render()
            // console.log(e.key)
        }

        document.addEventListener('keyup', onKeyUp)


        // const url = "https://picsum.photos/200/300"

        // const loadSomeImage = (url: string) => {
        //     return new Promise((resolve, reject) => {
        //         const img = new Image()
        //         img.onload = () => resolve(img)
        //         img.onerror = reject
        //         img.src = url
        //     })
        // }

        // const start = () => {
        //     loadSomeImage(url).then((image: any) => {
        //         console.log("image width ", image.width as number)
        //         console.log("image height ", image.height as number)
        //     })
        //     console.log("this line")
        // }

        // const startAsync = async () => {
        //     const image: any = await loadSomeImage(url)
        //     console.log("image width ", image.width as number)
        //     console.log("image height ", image.height as number)
        //     console.log("this line async")
        // }

        // start()
        // startAsync()

        // --- Custom MediaRecorder implementation ---
        const startRecording = (canvas: HTMLCanvasElement) => {
            const stream = canvas.captureStream(30); // 30 FPS stream from canvas
            recordedChunks = [];

            // Choose optimal video codec supported by your browser
            let options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm;codecs=vp8' };
            }

            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const { fetchFile } = await import('@ffmpeg/util');

                // ffmpeg is already loaded — no wait needed
                await ffmpeg.writeFile('input.webm', await fetchFile(blob));
                // ultrafast: much faster encoding, slightly larger file
                await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p', 'output.mp4']);
                const data = await ffmpeg.readFile('output.mp4');

                const url = URL.createObjectURL(new Blob([data as Uint8Array<ArrayBuffer>], { type: 'video/mp4' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sketch-recording.mp4';
                a.click();
                URL.revokeObjectURL(url);
                console.log("✅ MP4 downloaded!");
            };

            mediaRecorder.start();
            console.log("🔴 Recording started...");
        };

        const stopRecording = () => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                console.log("⏹️ Converting to MP4...");
            }
        };

        // --- Keydown Listener ---
        const handleKeyDown = (ev: KeyboardEvent) => {
            if (!manager || !canvasRef.current) return;
            const isModKey = ev.metaKey || ev.ctrlKey;
            const key = ev.key.toLowerCase();

            // Cmd + A to toggle video recording
            if (key === "a" && !ev.shiftKey && isModKey) {
                ev.preventDefault();

                // Toggle recording state
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    stopRecording();
                } else {
                    startRecording(canvasRef.current);
                }
            }

            // Cmd + S to save a single frame screenshot
            if (key === "s" && !ev.shiftKey && isModKey) {
                ev.preventDefault();
                manager.exportFrame();
            }
        };

        canvasRef.current?.addEventListener("keydown", handleKeyDown);

        return () => {
            isMounted = false;
            canvasRef.current?.removeEventListener("keydown", handleKeyDown);
            stopRecording();
            if (manager) {
                manager.unload();
            }
        }
    }, [sketch])



    return (
        <section className={styles.section}>
            <div className={styles.wrapper}>
                <canvas width={"100%"} height={"100%"} ref={canvasRef} tabIndex={0} style={{ outline: "none" }}></canvas>
            </div>
        </section>
    )
}

