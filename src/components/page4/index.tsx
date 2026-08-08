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


export default function Page4() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    // @ts-ignore — loaded client-side only inside canvas-sketch's useEffect
    const random = require("canvas-sketch-util/random");
    const TweakPage = require("tweakpane");


    const width = 2100;
    const height = 2100;

    const settings = {
        dimensions: [width, height],
        canvas: canvasRef.current,
        animate: true,
        hotkeys: false,
    }



    // const animate = () => {
    //     console.log("domestika")
    //     requestAnimationFrame(animate);
    // }

    const params = {
        cols: 100,
        rows: 100,
        scaleMin: 5,
        scaleMax: 20,
        freq: 0.001,
        amp: 0.25,
        frameSpeed: 10,
        animate: true,
        frame: 0,
        lineCap: "butt"
    }

    const createPane = () => {
        const pane = new TweakPage.Pane();
        let folder;

        folder = pane.addFolder({ title: "Noise Grid" })
        folder.addBinding(params, "lineCap", { options: { "Butt": "butt", "Round": "round", "Square": "square" } })
        folder.addBinding(params, "cols", { min: 2, max: 500, step: 1 })
        folder.addBinding(params, "rows", { min: 2, max: 500, step: 1 })
        folder.addBinding(params, "scaleMin", { min: 0, max: 20, step: 0.25 })
        folder.addBinding(params, "scaleMax", { min: 0, max: 100, step: 1 })
        folder.addBinding(params, "freq", { min: -0.01, max: 0.01, step: 0.00001 })
        folder.addBinding(params, "amp", { min: 0, max: 1, step: 0.001 })
        folder.addBinding(params, "frameSpeed", { min: 0, max: 100, step: 1 })
        folder.addBinding(params, "animate")
        folder.addBinding(params, "frame", { min: 0, max: 999 })
    }




    const sketch = () => {


        return ({ context, width, height, frame }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number }) => {
            context.fillStyle = "white";
            context.fillRect(0, 0, width, height);

            const f = params.animate ? frame : params.frame;

            const cols = params.cols;
            const rows = params.rows;
            const scaleMin = params.scaleMin;
            const scaleMax = params.scaleMax;
            const freq = params.freq;
            const amp = params.amp;

            const numCells = cols * rows;

            const gridw = width * 0.8;
            const gridh = height * 0.8;
            const cellw = gridw / cols;
            const cellh = gridh / rows;
            const margX = (width - gridw) / 2;
            const margY = (height - gridh) / 2;

            for (let i = 0; i < numCells; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const x = col * cellw + margX + cellw * 0.5;
                const y = row * cellh + margY + cellh * 0.5;
                const w = cellw * 0.8;
                const h = cellh * 0.8;
                const vel = f * params.frameSpeed;

                // // noise2D returns -1 to 1, multiply by PI to get a rotation angle
                // const n = random.noise2D(x + frame * 10, y, freq)\
                // noise3D returns -1 to 1, multiply by PI to get a rotation angle

                const n = random.noise3D(x, y, vel, freq)
                const angle = n * (Math.PI * amp);
                const scale = mapRange(n, -1, 1, scaleMin, scaleMax)

                context.save()
                context.translate(x, y);
                context.rotate(angle);
                context.lineWidth = scale
                context.lineCap = params.lineCap as CanvasLineCap;

                context.beginPath()
                context.moveTo(w * -0.5, 0)
                context.lineTo(w * 0.5, 0)
                context.strokeStyle = "olive"
                context.stroke()
                context.restore()
            }

        };
    };


    useEffect(() => {
        let isMounted = true;
        let manager: any = null;

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

