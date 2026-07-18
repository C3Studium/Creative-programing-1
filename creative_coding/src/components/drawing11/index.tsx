// Leasson 2 - this is only for mause interaction and how quadratic curves work

import { useEffect, useRef, useState } from "react"
import interpolate from "color-interpolate";

import styles from "./styles.module.scss"
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const degToRad = (degree: number) => {
    return degree * Math.PI / 180;
}


export default function Drawing11() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const random = require("canvas-sketch-util/random");
    const math = require("canvas-sketch-util/math");
    const colour = require("canvas-sketch-util/color");
    const risoColors = require("riso-colors");
    const colorMap = require("colormap");
    const eases = require("eases")

    const managerRef = useRef<any>(null);
    const elCanvas = useRef<HTMLCanvasElement | null>(null);
    const CursorRef = useRef<HTMLElement | null>(null);
    const cursorCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const imgCanvasRefA = useRef<HTMLCanvasElement | null>(null);
    const imgCanvasRefB = useRef<HTMLCanvasElement | null>(null);

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

    const particles = [] as Particle[];
    let pos = [] as any[]

    const numCircles = 50;
    const gap = 2;
    let dotRadius = 15;
    let cirRadius = 0;
    const fitRadius = dotRadius


    const colors = colorMap({
        colormap: "viridis",
        nshades: 20,
    });


    let imgA: HTMLImageElement;
    let imgB: HTMLImageElement;

    class Particle {
        x: number;
        y: number;
        r: number;

        ax: number;
        ay: number;

        vx: number;
        vy: number;
        color: string;
        minDis: number;
        pushFactor: number;
        pullFactor: number
        ix: number;
        iy: number;
        dampingFactor: number;
        scale: number;
        colA: string;
        colMap: (t: number) => string;

        constructor(params: { x: number, y: number, r: number, vx: number, vy: number, ax: number, ay: number, color: string, minDis: number, pushFactor: number, ix: number, iy: number, fx: number, fy: number, colA: string, colMap: any }) {
            // position
            this.x = params.x
            this.y = params.y


            // color
            // this.color = colors[0]

            // size
            this.r = params.r || 10

            //acceleration
            this.ax = params.ax || 0
            this.ay = params.ay || 0

            // velocity
            this.vx = params.vx || 0
            this.vy = params.vy || 0

            // min distance
            this.minDis = random.range(50, 200)

            // ideal position
            this.ix = params.x || 0;
            this.iy = params.y || 0;
            this.pushFactor = random.range(0.75, 2);
            this.pullFactor = random.range(0.001, 0.005);
            this.dampingFactor = random.range(0.9, 0.99);

            this.scale = 1

            this.colA = params.colA
            this.color = this.colA

            this.colMap = params.colMap
        }

        bounce(width: number, height: number) {
            if (this.x <= 0 || this.x >= width) this.vx *= -1
            if (this.y <= 0 || this.y >= height) this.vy *= -1
        }

        update() {
            let dx, dy, dd, dDelta
            // setting the index for color array
            let idxColor

            // pull force
            dx = this.ix - this.x
            dy = this.iy - this.y
            dd = Math.sqrt(dx * dx + dy * dy)

            this.scale = math.mapRange(dd, 0, 200, 1, 3);


            // the index has to be integer an 
            // idxColor = Math.floor(math.mapRange(dd, 0, 200, 0, colors.length - 1, true));
            // this.color = colors[idxColor];

            const t = math.mapRange(dd, 0, 200, 0, 1, true)
            this.color = this.colMap(t);

            this.ax = dx * this.pullFactor
            this.ay = dy * this.pullFactor

            // calculating the distance between cursor and particle -- AKA push force
            dx = this.x - cursorCoords.current.x
            dy = this.y - cursorCoords.current.y
            // distance
            dd = Math.sqrt(dx * dx + dy * dy)

            dDelta = (this.minDis - dd) * 3 / this.minDis;

            if (dd < this.minDis) {
                // it will be stronger the closer the mouse is
                this.ax += (dx / dd) * dDelta * this.pushFactor;
                this.ay += (dy / dd) * dDelta * this.pushFactor;
            }

            // update velocity
            this.vx += this.ax;
            this.vy += this.ay;

            // damping
            this.vx *= this.dampingFactor;
            this.vy *= this.dampingFactor;

            // update position
            this.x += this.vx;
            this.y += this.vy;

        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.beginPath()
            ctx.arc(0, 0, this.r * this.scale, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore()
        }
    }


    const onMouseMove = (e: MouseEvent) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width * width;
        const y = (e.clientY - rect.top) / rect.height * height;

        cursorCoords.current.x = x;
        cursorCoords.current.y = y;


    }

    const loadImage = async (url: string) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = url
        })
    }



    const sketch = ({ width, height, canvas }: any) => {
        elCanvas.current = canvas;

        const imgCanvasRefA = document.createElement("canvas")
        const imgContextA = imgCanvasRefA.getContext("2d") as CanvasRenderingContext2D;

        const imgCanvasRefB = document.createElement("canvas")
        const imgContextB = imgCanvasRefB.getContext("2d") as CanvasRenderingContext2D;

        imgCanvasRefA.width = imgA.width;
        imgCanvasRefA.height = imgA.height;

        imgCanvasRefB.width = imgB.width;
        imgCanvasRefB.height = imgB.height;

        imgContextA.drawImage(imgA, 0, 0);
        imgContextB.drawImage(imgB, 0, 0);

        const imgDataA = imgContextA.getImageData(0, 0, imgA.width, imgA.height);
        const imgDataB = imgContextB.getImageData(0, 0, imgB.width, imgB.height);

        const dataA = imgDataA.data;
        const dataB = imgDataB.data;





        let x, y, particle, radius

        // for (let i = 0; i < 200; i++) {
        //     x = width * 0.5;
        //     y = height * 0.5;

        //     pos = random.insideCircle(400);
        //     x += pos[0];
        //     y += pos[1];

        //     particle = new Particle({ x, y, r: 10 })
        //     particles.push(particle)
        // }

        for (let i = 0; i < numCircles; i++) {
            const circumference = Math.PI * 2 * (cirRadius);
            const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gap)) : 1;
            const fitSlice = Math.PI * 2 / numFit

            let ix, iy, idx, r, g, b, colA, colB, colMap

            for (let j = 0; j < numFit; j++) {
                const theta = fitSlice * j;

                x = Math.cos(theta) * (cirRadius);
                y = Math.sin(theta) * (cirRadius);

                radius = dotRadius;
                x += width * 0.5;
                y += height * 0.5;

                ix = Math.floor((x / width) * imgA.width);
                iy = Math.floor((y / height) * imgA.height);

                idx = (iy * imgA.width + ix) * 4;

                r = dataA[idx + 0]
                g = dataA[idx + 1]
                b = dataA[idx + 2]
                colA = `rgb(${r},${g},${b})`

                radius = math.mapRange(r, 0, 255, 1, 12)

                r = dataB[idx + 0]
                g = dataB[idx + 1]
                b = dataB[idx + 2]
                colB = `rgb(${r},${g},${b})`

                colMap = interpolate([colA, colB])

                particle = new Particle({ x, y, r: radius, colMap })
                particles.push(particle)
            }

            cirRadius += fitRadius * 2 + gap;
            dotRadius = (1.15 - eases.quadOut(i / numCircles)) * fitRadius;
        }



        return ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number, stroke: string }) => {
            context.fillStyle = "black";
            context.fillRect(0, 0, width, height);

            context.save();

            // context.drawImage(imgA, 0, 0);

            particles.sort((a: Particle, b: Particle) => a.scale - b.scale);
            particles.forEach((p) => {
                p.update();
                p.bounce(width, height)
                p.draw(context);
            })
            context.restore();

        };
    };


    useEffect(() => {

        const canvas = canvasRef.current
        if (!canvas) return;
        // Mouse interaction

        canvas.addEventListener("mousemove", onMouseMove)

        return () => {
            canvas.removeEventListener("mousemove", onMouseMove)
        }
    }, [])




    useEffect(() => {
        let isMounted = true;

        let manager: any = null;

        // --- MediaRecorder State variables ---
        let mediaRecorder: MediaRecorder | null = null;
        let recordedChunks: Blob[] = []

        const InitSketch = async () => {
            const canvasSketchModule = require("canvas-sketch");
            const canvasSketch = canvasSketchModule.default || canvasSketchModule;

            if (!canvasRef.current || !isMounted) return


            const start = async () => {
                imgA = await loadImage('/assets/img1.png') as HTMLImageElement
                imgB = await loadImage('/assets/img2.png') as HTMLImageElement
            }

            await start();


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
            if (!managerRef.current || !canvasRef.current) return;
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
                managerRef.current.exportFrame();
            }
        };

        canvasRef.current?.addEventListener("keydown", handleKeyDown);

        return () => {
            isMounted = false;
            canvasRef.current?.removeEventListener("keydown", handleKeyDown);
            stopRecording();
            if (managerRef.current) {
                managerRef.current.unload();
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

