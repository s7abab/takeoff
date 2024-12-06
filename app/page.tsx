import FabricCanvas from '@/components/FabricCanvas';
import PdfCanvas from '../components/PdfCanvas';

export default function Home() {
	return (
		<div className="relative w-full h-screen">
			<div className="absolute inset-0 z-0">
				<PdfCanvas />
			</div>
			<div className="absolute inset-0 z-10 pointer-events-none">
				<FabricCanvas />
			</div>
		</div>
	);
}
