'use client';
import { useEffect, useRef } from 'react';
import { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { Canvas, FabricImage } from 'fabric';

export default function App() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const renderTaskRef = useRef<RenderTask | null>(null);

	useEffect(() => {
		let isCancelled = false;

		(async function () {
			// Initialize Fabric canvas
			if (canvasRef.current && !fabricCanvasRef.current) {
				fabricCanvasRef.current = new Canvas(canvasRef.current, {
					backgroundColor: '#ffffff',
					selection: true,
				});
			}

			const pdfJS = await import('pdfjs-dist/build/pdf');
			pdfJS.GlobalWorkerOptions.workerSrc = 
				window.location.origin + '/pdf.worker.min.mjs';

			const pdf: PDFDocumentProxy = await pdfJS.getDocument('example.pdf').promise;
			const page: PDFPageProxy = await pdf.getPage(1);
			const viewport = page.getViewport({ scale: 1.5 });

			// Set canvas dimensions
			fabricCanvasRef.current?.setDimensions({
				width: viewport.width,
				height: viewport.height,
			});

			// Create an offscreen canvas for PDF rendering
			const offscreenCanvas = document.createElement('canvas');
			const offscreenContext = offscreenCanvas.getContext('2d');
			if (!offscreenContext) return;

			offscreenCanvas.height = viewport.height;
			offscreenCanvas.width = viewport.width;

			if (renderTaskRef.current) {
				await renderTaskRef.current.promise;
			}

			const renderContext = { canvasContext: offscreenContext, viewport };
			const renderTask = page.render(renderContext);
			renderTaskRef.current = renderTask;

			try {
				await renderTask.promise;
				
				// Convert the PDF page to a Fabric image
				FabricImage.fromURL(
					offscreenCanvas.toDataURL(), 
					{
						crossOrigin: 'anonymous'
					}
				).then(img => {
					if (!isCancelled && fabricCanvasRef.current) {
						fabricCanvasRef.current.backgroundImage = img;
						fabricCanvasRef.current.renderAll();
					}
				});
			} catch (error) {
				if (error instanceof Error && error.name === 'RenderingCancelledException') {
					console.log('Rendering cancelled.');
				} else {
					console.error('Render error:', error);
				}
			}
		})();

		return () => {
			isCancelled = true;
			if (renderTaskRef.current) {
				renderTaskRef.current.cancel();
			}
			// Clean up Fabric canvas
			fabricCanvasRef.current?.dispose();
		};
	}, []);

	return (
		<canvas 
			ref={canvasRef} 
			className="h-screen w-full"
		/>
	);
}