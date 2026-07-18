// Leasson 2 - this is only for mause interaction and how quadratic curves work

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const degToRad = (degree: number) => {
    return degree * Math.PI / 180;
}


export default function Drawing4() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const random = require("canvas-sketch-util/random");
    const math = require("canvas-sketch-util/math");
    const colour = require("canvas-sketch-util/color");
    const risoColors = require("riso-colors");
    const colorMap = require("colormap");

    const seed = random.getRandomSeed()

    const width = 2100;
    const height = 2100;

    const settings = {
        dimensions: [width, height],
        canvas: canvasRef.current,
        animate: true,
        hotkeys: false,
        name: seed,
    }



    // const animate = () => {
    //     console.log("domestika")
    //     requestAnimationFrame(animate);


    // }

    const cols = 6000;
    const rows = 1;
    const cells = cols * rows;

    // grid dimesions
    const gridW = width * 0.8;
    const gridH = height * 0.8;
    const marginX = (width - gridW) * 0.5;
    const marginY = (height - gridH) * 0.5;
    // cell size
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    const points = [] as Point[];

    let x: number, y: number, n: number, lineWidth: number, color: string;

    let lastX: number, lastY: number;

    let frequency = 0.002;
    let amplitude = 90;

    let amp = amplitude / 10;

    const colors = colorMap({
        colormap: "magma",
        nshades: amplitude,
        format: "hex",
        alpha: 1
    })

    const sketch = () => {
        random.setSeed(seed)



        for (let i = 0; i < cells; i++) {
            x = (i % cols) * cellW;
            y = Math.floor(i / cols) * cellH;

            n = random.noise2D(x, y, frequency, amplitude);
            // x += n;
            // y += n;

            lineWidth = math.mapRange(n, -amplitude, amplitude, 2, 5);
            color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))];
            points.push(new Point(x, y))
        }



        return ({ context, width, height, frame }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number, stroke: string }) => {
            context.fillStyle = "black";
            context.fillRect(0, 0, width, height);

            context.save();
            context.translate(marginX + cellW * 0.5, marginY + cellH * 0.5)
            context.strokeStyle = "red";
            context.lineWidth = 4;


            const timeX = frame * amp
            const timeY = frame * amp / 2

            //draw lines 

            for (let r = 0; r < rows; r++) {


                for (let c = 0; c < cols - 1; c++) {
                    const curr = points[r * cols + c + 0];
                    const next = points[r * cols + c + 1];

                    if (!curr || !next) continue;

                    const mx = curr.x + (next.x - curr.x) * 0.5;
                    const my = curr.y + (next.y - curr.y) * 0.5;

                    if (!c) {
                        lastX = curr.x;
                        lastY = curr.y;
                    }

                    context.strokeStyle = curr.color;
                    context.beginPath();

                    context.lineWidth = curr.lineWidth;
                    context.moveTo(lastX, lastY)
                    context.quadraticCurveTo(curr.x, curr.y, mx, my);

                    context.stroke()

                    // lastX = mx - c / cols * 300;
                    // lastY = my - r / rows * 300;

                    lastX = mx - (1 * (curr.x + lastX + next.x) * randomRange(-0.005, 0)) + 100 * c / cols * -5;
                    lastY = my - (1 * (curr.y + lastY + next.y) * randomRange(-0.005, 0)) + 100 * r / rows * -5;
                }


                points.forEach((point) => {
                    n = random.noise2D(point.iX + timeX, point.iY + timeY, frequency, amplitude);
                    point.x = point.iX + n;
                    point.y = point.iY + n;
                })
            }

            points.forEach((point) => {
                point.draw(context)
            })


            context.restore();

        };
    };

    class Point {
        x: number;
        y: number;
        lineWidth: number;
        color: string;
        iX: number;
        iY: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.lineWidth = lineWidth;
            this.color = color;

            this.iX = x;
            this.iY = y;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.beginPath()
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fillStyle = "transparent";
            ctx.fill();
            ctx.restore();
        }
    }

    useEffect(() => {
        let isMounted = true;
        let manager: any = null;

        // --- MediaRecorder State variables ---
        let mediaRecorder: MediaRecorder | null = null;
        let recordedChunks: Blob[] = [];


        const InitSketch = async () => {
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

// class Point {
//     constructor(public x: number, public y: number) {
//         this.x = x;
//         this.y = y;
//     }
// }

