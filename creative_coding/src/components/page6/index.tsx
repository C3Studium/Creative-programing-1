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

type AgentProps = {
    home: PointProps,
    pos: PointProps,
    offset: VectorProps,
    radius: number,
    moveRadius: number,
    noiseOffset: number,
    speed: number,
    sAngle: number,
    eAngle: number,
    draw: (context: CanvasRenderingContext2D) => void
    bounce: (width: number, height: number) => void
    update: (frame: number, random: any) => void
}

type PointProps = {
    x: number,
    y: number,
    getDistance: (v: PointProps) => number
}

type VectorProps = {
    x: number,
    y: number,
}


export default function Page6() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const random = require("canvas-sketch-util/random");

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



    const sketch = () => {

        const agents: AgentProps[] = []

        const num = 500

        for (let i = 0; i < num; i++) {
            const x = randomRange(0, width)
            const y = randomRange(0, height)

            agents.push(new Agent(x, y,))
        }

        return ({ context, width, height, frame }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number }) => {
            context.fillStyle = "white";
            context.fillRect(0, 0, width, height);


            for (let i = 0; i < agents.length; i++) {
                const agent = agents[i]

                for (let j = i + 1; j < agents.length; j++) {
                    const other = agents[j];

                    const distance = agent.pos.getDistance(other.pos)

                    const maxDist = 400
                    if (distance >= maxDist) continue

                    context.save()
                    context.lineWidth = mapRange(distance, maxDist, 0, 0.01, 0.2, true);
                    context.beginPath();
                    context.moveTo(agent.pos.x, agent.pos.y);
                    context.lineTo(other.pos.x, other.pos.y);
                    context.stroke()
                    context.restore()
                }
            }


            // const agentA = new Agent(800, 400)
            // const agentB = new Agent(300, 700)
            // const agentC = new Agent(200, 400)
            // const agentD = new Agent(500, 400)

            // agentA.draw(context);
            // agentB.draw(context);
            // agentC.draw(context);
            // agentD.draw(context);


            agents.forEach(agent => {
                agent.update(frame, random)
                agent.bounce(width, height)
                agent.draw(context)
            })

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

class Vector {
    constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
    }

    getDistance(v: PointProps) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;

        return Math.sqrt(dx * dx + dy * dy)
    }
}

class Agent implements AgentProps {
    home: PointProps;
    pos: PointProps;
    offset: VectorProps;
    radius: number;
    moveRadius: number;
    noiseOffset: number;
    speed: number;
    sAngle: number;
    eAngle: number;

    constructor(x: number, y: number,) {
        this.home = new Vector(x, y)
        this.pos = new Vector(x, y)
        this.offset = new Vector(0, 0)
        this.radius = randomRange(0.5, 2);
        this.moveRadius = randomRange(100, 350);
        this.noiseOffset = randomRange(900, 1800);
        this.speed = randomRange(-0.01, 0.01);
        this.sAngle = 0;
        this.eAngle = Math.PI * 2;

        // const radius = Math.random() * width;
        //     const speed = Math.random() * 0.1 + 0.1;
        //     const frames = 10;

        //     const angle = randomRange(0, 1) * Math.PI * 2;
        //     const time = speed * frames;

        //     const x = baseX + Math.cos(angle * time) * radius;
        //     const y = baseY + Math.sin(angle * time) * radius;


    }

    bounce(width: number, height: number) {
        this.pos.x = Math.max(0, Math.min(width, this.pos.x))
        this.pos.y = Math.max(0, Math.min(height, this.pos.y))
    }

    update(frame: number, random: any) {
        const time = frame * this.speed;

        this.offset.x = random.noise3D(this.home.x, this.home.y, time + this.noiseOffset) * this.moveRadius;
        this.offset.y = random.noise3D(this.home.y, this.home.x, time + this.noiseOffset) * this.moveRadius;

        this.pos.x = this.home.x + this.offset.x;
        this.pos.y = this.home.y + this.offset.y;

        // this.pos.x += this.vel.x * randomRange(0, 15);
        // this.pos.y += this.vel.y * randomRange(0, 5);
    }

    draw(context: CanvasRenderingContext2D) {
        context.save()
        context.lineWidth = randomRange(0.5, 1);
        context.translate(this.pos.x, this.pos.y)
        context.rotate(this.sAngle)
        context.beginPath();
        context.arc(0, 0, this.radius, this.sAngle, this.eAngle);
        context.fillStyle = 'black';
        context.fill();
        context.stroke();
        context.restore();
    }
}
