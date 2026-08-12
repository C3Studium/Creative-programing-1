// Leasson 2 - this is only for mause interaction and how quadratic curves work

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const degToRad = (degree: number) => {
    return degree * Math.PI / 180;
}


export default function Drawing5() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const random = require("canvas-sketch-util/random");
    const math = require("canvas-sketch-util/math");
    const colour = require("canvas-sketch-util/color");
    const risoColors = require("riso-colors");
    const colorMap = require("colormap");
    const eases = require("eases")

    const managerRef = useRef<any>(null);

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

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioDataRef = useRef<Float32Array | null>(null);
    const sourceNodeRef = useRef<any>(null);
    const analyserNodeRef = useRef<any>(null);

    /// BASE vars in a Refs
    const minDB = useRef<number | null>(null);
    const maxDB = useRef<number | null>(null);

    const addListener = () => {

        if (!audioContextRef.current) createAudio()

        if (!audioRef.current) return;
        if (audioRef.current.paused) {
            audioRef.current.play()
            managerRef.current?.play()
        } else {
            audioRef.current.pause()
            managerRef.current?.pause()
        }
    }

    const sketch = () => {

        // here we commented out bins and we are going to use different for loop so they are for each arc and each slice within them
        // const bins = [8, 16, 32, 64, 128, 252, 512, 1024]

        let bin, mapped;
        let bins = [] as number[];

        const numCircles = 50;
        const numSlices = 10;
        const slice = Math.PI * 2 / numSlices;
        const radius = 300

        let lineWidths = [];
        let lineWidth;

        // we can remove the anition for some bins / slices, to do that we can save each "bin state" and each "lineWidth state" so they wont change over time unless we want them to

        for (let b = 0; b < numCircles * numSlices; b++) {
            bin = random.rangeFloor(8, 2048);
            if (random.value() < 0.15) bin = 0;
            bins.push(bin);
        }


        for (let i = 0; i < numCircles; i++) {
            const t = i / (numCircles - 1)

            lineWidth = eases.sineInOut(t) * 200 + 20;
            lineWidths.push(lineWidth)

        }

        return ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number, frame: number, stroke: string }) => {
            context.fillStyle = "#EEEAE0";
            context.fillRect(0, 0, width, height);

            if (!audioContextRef.current || !analyserNodeRef.current || !audioDataRef.current) return

            // audioData we are getting from FloatFrequencyData are clusters of frequency
            // The issue is that low frequences are clustered together a lot more than high frequencies, so the average conts is basically useless to visualize anything. 
            // we need to get precise data. with bins 

            analyserNodeRef.current.getFloatFrequencyData(audioDataRef.current);

            // const average = getAverage(audioDataRef.current);
            // const mapped = math.mapRange(audioDataRef.current[12], analyserNodeRef.current.minDecibels, analyserNodeRef.current.maxDecibels, 0, 1, true)
            // const radius = mapped * 200

            context.save();
            context.translate(width * 0.5, height * 0.5);

            // to get some visual with arcs, first we need either the arcs in full or their slices, this nestet for loop is just for that. 
            // then we need to use the bins to each slice and create some kind of transformation, 
            let cRadius = radius;

            for (let i = 0; i < numCircles; i++) {
                context.save();

                for (let j = 0; j < numSlices; j++) {

                    context.rotate(slice);

                    // now we need to use the bins to add to them each freq bin
                    // sometimes lineWidth becomes invalid number so it can stay in the prev number, we can fix that with conditionals

                    bin = bins[i * numSlices + j]
                    if (!bin) continue;

                    mapped = math.mapRange(audioDataRef.current[bin], minDB.current, maxDB.current, 0, 3, true);
                    lineWidth = lineWidths[i] * mapped;
                    if (lineWidth < 1) continue;

                    context.lineWidth = lineWidth;
                    context.beginPath();
                    context.arc(0, 0, cRadius + context.lineWidth * 0.5, 0, slice);
                    context.stroke();
                }

                cRadius += lineWidths[i]
                context.restore();
            }



            for (let i = 0; i < bins.length; i++) {

                const bin = bins[i]
                const mapped = math.mapRange(audioDataRef.current[bin], analyserNodeRef.current.minDecibels, analyserNodeRef.current.maxDecibels, 0, 1, true)
                const radius = mapped * 500

            }

            context.restore();

        };
    };

    const createAudio = () => {


        if (!audioRef.current) {
            audioRef.current = document.createElement("audio");
            audioRef.current.src = "/MP3/FLAMEBOY - Machine - Instrumental version.mp3";
        }

        // this is how we setup the audio config

        audioContextRef.current = new AudioContext();
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        analyserNodeRef.current.fftSize = 4096;
        analyserNodeRef.current.smoothingTimeConstant = 0.95;

        sourceNodeRef.current.connect(analyserNodeRef.current)
        analyserNodeRef.current.connect(audioContextRef.current.destination)

        audioDataRef.current = new Float32Array(analyserNodeRef.current.frequencyBinCount)


        minDB.current = analyserNodeRef.current.minDecibels;
        maxDB.current = analyserNodeRef.current.maxDecibels;

    }


    const getAverage = (data: Float32Array) => {
        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            sum += element;
        }

        return sum / data.length;
    }

    useEffect(() => {
        window.addEventListener("mousedown", addListener)

        return () => {
            window.removeEventListener("mousedown", addListener)
        }
    }, [])


    useEffect(() => {
        let isMounted = true;

        // --- MediaRecorder State variables ---
        let mediaRecorder: MediaRecorder | null = null;
        let recordedChunks: Blob[] = []

        const InitSketch = async () => {
            const canvasSketchModule = require("canvas-sketch");
            const canvasSketch = canvasSketchModule.default || canvasSketchModule;

            if (!canvasRef.current || !isMounted) return

            const finalSetting = {
                ...settings,
                canvas: canvasRef.current
            }

            try {
                managerRef.current = await canvasSketch(sketch, finalSetting);
                managerRef.current.pause()
                if (!isMounted) {
                    managerRef.current.unload();
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

