// Leasson 2 - this is only for mause interaction and how quadratic curves work

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const degToRad = (degree: number) => {
    return degree * Math.PI / 180;
}




export default function Drawing2() {
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
        animate: true,
        hotkeys: false,
        name: seed,
    }


    let ElCanvas
    let points: Point[]

    // const animate = () => {
    //     console.log("domestika")
    //     requestAnimationFrame(animate);


    // }


    const sketch = () => {
        random.setSeed(seed)

        points = [
            new Point(200, 540),
            new Point(400, 300),
            new Point(880, 540),
            new Point(600, 700),
            new Point(640, 900),
        ]


        return ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number, stroke: string }) => {
            context.fillStyle = "white";
            context.fillRect(0, 0, width, height);

            context.save();

            context.strokeStyle = "999"
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                context.lineTo(points[i].x, points[i].y);
            }

            context.stroke();

            // context.beginPath();
            // context.moveTo(points[0].x, points[0].y);

            // for (let i = 1; i < points.length; i += 2) {
            //     context.quadraticCurveTo(points[i + 0].x, points[i + 0].y, points[i + 1].x, points[i + 1].y);
            // }

            // context.stroke();
            context.beginPath();


            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i + 0];
                const next = points[i + 1];

                const mx = current.x + (next.x - current.x) * 0.5;
                const my = current.y + (next.y - current.y) * 0.5;

                // context.arc(mx, my, 10, 0, Math.PI * 2);
                // context.fillStyle = "blue";
                // context.fill();

                if (i === 0) context.moveTo(current.x, current.y)
                else if (i === points.length - 2) context.quadraticCurveTo(current.x, current.y, next.x, next.y)
                else context.quadraticCurveTo(current.x, current.y, mx, my)
                // context.quadraticCurveTo(next.x, next.y, mx, my)


            }
            context.lineWidth = 4;
            context.strokeStyle = "blue";
            context.stroke();

            points.forEach(p => p.draw(context))

            context.restore();

        };
    };

    class Point {
        x: number;
        y: number;
        control: boolean;
        isDraging: boolean;
        constructor(x: number, y: number, control: boolean = false) {
            this.x = x;
            this.y = y;
            this.control = control;
            this.isDraging = false;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = this.control ? "red" : "black"

            ctx.beginPath()
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        hitTest(x: number, y: number) {
            const dx = this.x - x;
            const dy = this.y - y;
            const dd = Math.sqrt(dx * dx + dy * dy)

            return dd < 20;
        }
    }


    const onMouseMove = (e: MouseEvent) => {
        ElCanvas = canvasRef.current;
        if (!ElCanvas) return

        const x = (e.offsetX / ElCanvas.offsetWidth) * ElCanvas.width;
        const y = (e.offsetY / ElCanvas.offsetHeight) * ElCanvas.height;

        points.forEach(point => {
            if (point.isDraging) {
                point.x = x;
                point.y = y;
            }
        });
    }
    const onMouseUp = (e: MouseEvent) => {
        points.forEach(point => {
            point.isDraging = false;
        })
    }

    const onMouseDown = (e: MouseEvent) => {
        ElCanvas = canvasRef.current;
        if (!ElCanvas) return

        let hit = false

        const x = (e.offsetX / ElCanvas.offsetWidth) * ElCanvas.width;
        const y = (e.offsetY / ElCanvas.offsetHeight) * ElCanvas.height;

        points.forEach(point => {
            point.isDraging = point.hitTest(x, y);
            if (!hit && point.isDraging) {
                hit = true
            }
        })

        if (!hit) points.push(new Point(x, y, true))
    }

    useEffect(() => {
        if (!canvasRef.current) return

        canvasRef.current?.addEventListener("mousemove", onMouseMove);
        canvasRef.current?.addEventListener("mouseup", onMouseUp);
        canvasRef.current?.addEventListener("mousedown", onMouseDown);

        return () => {
            canvasRef.current?.removeEventListener("mousemove", onMouseMove);
            canvasRef.current?.removeEventListener("mouseup", onMouseUp);
            canvasRef.current?.removeEventListener("mousedown", onMouseDown);
        }
    }, [])


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

