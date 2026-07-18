// Leasson 2

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

export default function Page2() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const width = 2100;
    const height = 2100;

    const settings = {
        dimensions: [width, height],
        canvas: canvasRef.current,
    }

    const degToRad = (degree: number) => {
        return degree * Math.PI / 180;
    }

    const sketch = () => {
        return ({ context, width, height }: { context: CanvasRenderingContext2D, width: number, height: number }) => {
            context.fillStyle = "white";
            context.fillRect(0, 0, width, height);

            const cx = width * 0.5;
            const cy = height * 0.5;
            let x, y;
            let h = randomRange(2.5, 20);
            let w = randomRange(50, 100);
            const num = randomRange(24, 72);

            const radius = width * randomRange(0.2, 0.35)


            for (let i = 0; i < num; i++) {
                const slice = degToRad(360 / num);
                const angle = slice * i;

                x = cx + radius * randomRange(0.8, 1.2) * Math.cos(angle)
                y = cy + radius * randomRange(0.8, 1.2) * Math.sin(angle)

                context.save();
                context.translate(x, y)
                context.rotate(angle)
                context.scale(2, randomRange(0.5, 1))


                context.beginPath()
                context.rect(w * 0.5, randomRange(0, h * 0.5), w, h)
                context.fillStyle = "black";
                context.fill();
                context.restore();




                for (let j = 0; j < randomRange(2, 6); j++) {
                    context.save()
                    context.lineWidth = randomRange(1.5, 12.5);
                    context.translate(cx, cy);
                    context.rotate(angle);
                    context.beginPath()
                    context.arc(0, 0, radius * randomRange(0.7, 1.5), slice * randomRange(1, -2.5), slice * randomRange(1, 5));
                    context.stroke()

                    context.restore();

                    for (let k = 0; k < randomRange(2, 3); k++) {
                        context.save();
                        context.translate(x, y);
                        context.rotate(angle * k);
                        context.scale(2, randomRange(0.75, 1.1))

                        context.beginPath()
                        context.rect(w * randomRange(0.5, 0.75), randomRange(0, h * 0.5), w * randomRange(1, 1.25), h * randomRange(0.05, 0.25))
                        context.fillStyle = "black";
                        context.fill();
                        context.restore();
                    }
                }

            }


            // context.lineWidth = 5;

            // context.save();
            // context?.beginPath()
            // context?.arc(300, 300, 100, 0, Math.PI * 2)
            // context?.stroke()
            // context.restore();

            // context.save();
            // context?.beginPath()
            // context?.rect(100, 100, 400, 400)
            // context?.stroke()
            // context.restore();

            // const w = 60;
            // const h = 60;
            // const gap = 20;
            // let x, y

            // for (let i = 0; i < 5; i++) {

            //     for (let j = 0; j < 5; j++) {

            //         x = 10 + 100 + (w + gap) * i;
            //         y = 10 + 100 + (h + gap) * j;
            //         context.save();
            //         context.lineWidth = 2;
            //         context?.beginPath();
            //         context?.rect(x, y, w, h)
            //         context?.stroke()

            //         if (Math.random() > 0.5) {
            //             context?.beginPath();
            //             context?.rect(x + 10, y + 10, w - 20, h - 20);
            //             context?.stroke();
            //         }
            //         context.restore();
            //     }


            // }

        };
    };


    useEffect(() => {
        let isMounted = true;

        // this will manage the instance and insures instant load upon cmd+s
        let manager: any = null;

        const InitSketch = async () => {
            // @ts-ignore
            const canvasSketchModule = require("canvas-sketch");
            const canvasSketchToolsModule = require("canvas-sketch-util")

            const canvasSketch = canvasSketchModule.default || canvasSketchModule;
            const canvasSketchTools = canvasSketchToolsModule.default || canvasSketchToolsModule;


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

        }

        InitSketch()

        return () => {
            isMounted = false;
            if (manager) {
                manager.unload();
            }
        }
    }, [sketch])


    return (
        <section className={styles.section}>
            <div className={styles.wrapper}>
                <canvas width={"100%"} height={"100%"} ref={canvasRef}></canvas>
            </div>
        </section>
    )
}