// Leasson 2

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const degToRad = (degree: number) => {
    return degree * Math.PI / 180;
}



export default function Drawing1() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const random = require("canvas-sketch-util/random");
    const math = require("canvas-sketch-util/math");
    const color = require("canvas-sketch-util/color");
    const risoColors = require("riso-colors");

    const seed = random.getRandomSeed()

    const width = 2100;
    const height = 2100;

    const settings = {
        dimensions: [width, height],
        canvas: canvasRef.current,
        animate: false,
        hotkeys: false,
        name: seed,
    }


    // const animate = () => {
    //     console.log("domestika")
    //     requestAnimationFrame(animate);


    // }

    const drawRandomSkewedRectangle = ({ x, y, w, h, degree, ctx, blend }: { x: number, y: number, w: number, h: number, degree: number, ctx: CanvasRenderingContext2D, blend: string }) => {
        const angle = degToRad(degree);
        const cx = w * Math.cos(angle)
        const cy = w * Math.sin(angle)

        blend = (random.value() > 0.5) ? "overlay" : "source-over";

        ctx.save();
        ctx.translate(cx * 0.5, (cy + h) * 0.5);

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy + h)
        ctx.lineTo(0, h)
        ctx.closePath()

        ctx.restore()

    }

    const drawPolygon = ({ context, radius, sides = 3 }: { context: CanvasRenderingContext2D, radius: number, sides: number }) => {
        const slice = Math.PI * 2 / sides;

        context.beginPath();
        context.moveTo(0, -radius);

        for (let i = 0; i < sides; i++) {
            const theta = i * slice - Math.PI * 0.5;
            context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius)
        }

        context.closePath();

    }


    const sketch = () => {
        random.setSeed(seed)


        let count = randomRange(20, 40)

        let degree



        const rects = [] as any[];

        const bgColor = random.pick(risoColors).hex;

        const mask = {
            x: width * 0.5,
            y: height * 0.58,
            radius: 1000,
            sides: 3
        };

        const strokeColors = [
            random.pick(risoColors),
            random.pick(risoColors),
        ] as string[]

        const rectColors = [
            random.pick(risoColors),
            random.pick(risoColors),
        ] as any[]

        for (let i = 0; i < count; i++) {
            rects.push({
                x: randomRange(-width * 0.5, width * 0.5),
                y: randomRange(-height * 0.5, height * 0.5),
                w: randomRange(width * 0.4, width * 0.8),
                h: randomRange(height * 0.1, height * 0.25),
                stroke: random.pick(strokeColors).hex,
                fill: random.pick(rectColors).hex,
                blend: random.pick(["overlay", "source-over"]),
            });
        }


        return ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number, stroke: string }) => {
            context.fillStyle = color.style(bgColor);
            context.fillRect(0, 0, width, height);

            context.save();

            context.translate(mask.x, mask.y)
            drawPolygon({ context, radius: mask.radius, sides: mask.sides })

            context.clip();


            rects.forEach((rect: any) => {
                const { x, y, w, h, fill, stroke, blend } = rect
                const shadowColor = color.offsetHSL(fill, 0, 0, -20)
                shadowColor[3] = 0.75
                degree = randomRange(10, 20);

                context.save();
                context.translate(-mask.x, -mask.y)
                context.translate(x, y)
                context.strokeStyle = stroke
                context.fillStyle = fill
                context.lineWidth = randomRange(10, 15)


                context.globalCompositeOperation = "overlay"


                drawRandomSkewedRectangle({
                    x,
                    y,
                    w,
                    h,
                    degree,
                    ctx: context,
                    blend: blend
                })

                context.shadowColor = color.style(shadowColor.rgba)
                context.shadowOffsetX = -20;
                context.shadowOffsetY = 10;

                context.fill();
                context.shadowColor = "";
                context.stroke();

                context.globalCompositeOperation = "source-over"

                context.lineWidth = 2;
                context.strokeStyle = "black";
                context.stroke()

                context.restore();
            })

            context.restore();

            // polygon outline
            context.save();
            context.translate(mask.x, mask.y);
            context.lineWidth = 40;

            drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides })

            context.globalCompositeOperation = "color-burn"
            context.strokeStyle = rectColors[1].hex
            context.stroke();
            context.restore();

        };
    };


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

