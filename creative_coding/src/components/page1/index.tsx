// Leasson 1

import { useEffect, useRef } from "react"

import styles from "./styles.module.scss"

export default function Page1() {
    const ref = useRef<HTMLCanvasElement>(null)




    const years: number[] = []
    for (let i = 0; i < 5; i++) {
        years.push(2026 + i)
    }

    years.forEach(year => {

    })
    useEffect(() => {
        console.log(years)

        const canvas = ref?.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctx.lineWidth = 5;

        ctx?.beginPath()
        ctx?.arc(300, 300, 100, 0, Math.PI * 2)
        ctx?.stroke()
        ctx?.beginPath()
        ctx?.rect(100, 100, 400, 400)
        ctx?.stroke()

        const width = 60;
        const height = 60;
        const gap = 20;
        let x, y

        for (let i = 0; i < 5; i++) {

            for (let j = 0; j < 5; j++) {

                x = 10 + 100 + (width + gap) * i;
                y = 10 + 100 + (height + gap) * j;
                ctx.lineWidth = 2;
                ctx?.beginPath();
                ctx?.rect(x, y, width, height)
                ctx?.stroke()

                if (Math.random() > 0.5) {
                    ctx?.beginPath();
                    ctx?.rect(x + 10, y + 10, width - 20, height - 20);
                    ctx?.stroke();
                }
            }


        }
    }, [])

    return (
        <section className={styles.section}>
            <canvas className={styles.canvas} width={"600px"} height={"600px"} ref={ref}>
            </canvas>
        </section>
    )
}



// const canvasSketch = require('canvas-sketch');

// const settings = {
//   dimensions: [ 1080, 1080 ]
// };

// const sketch = () => {
//   return ({ context, width, height }) => {
//     context.fillStyle = 'white';
//     context.fillRect(0, 0, width, height);
//     context.lineWidth = width * 0.01;

//     const w 	= width  * 0.10;
// 		const h 	= height * 0.10;
// 		const gap = width  * 0.03;
// 		const ix 	= width  * 0.17;
// 		const iy 	= height * 0.17;

// 		const off = width  * 0.02;

// 		let x, y;

// 		for (let i = 0; i < 5; i++) {
// 			for (let j = 0; j < 5; j++) {
// 				x = ix + (w + gap) * i;
// 				y = iy + (h + gap) * j;

// 				context.beginPath();
// 				context.rect(x, y, w, h);
// 				context.stroke();

// 				if (Math.random() > 0.5) {
// 					context.beginPath();
// 					context.rect(x + off / 2, y + off / 2, w - off, h - off);
// 					context.stroke();
// 				}
// 			}
// 		}
//   };
// };

// canvasSketch(sketch, settings);