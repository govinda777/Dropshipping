import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface TestArtifact {
  scenarioName: string;
  status: 'passed' | 'failed' | 'unknown';
  screenshotUrl: string | null;
  videoUrl: string | null;
}

export default async function E2ETestsReportPage() {
  const publicE2ePath = path.join(process.cwd(), 'public/e2e');
  const screenshotsDir = path.join(publicE2ePath, 'screenshots');
  const videosDir = path.join(publicE2ePath, 'videos');

  let screenshots: string[] = [];
  let videos: string[] = [];

  if (fs.existsSync(screenshotsDir)) {
    screenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
  }
  if (fs.existsSync(videosDir)) {
    videos = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
  }

  // Agrupa artefatos pelo nome do cenário
  const artifactsMap = new Map<string, TestArtifact>();

  const getScenarioDisplayName = (filename: string) => {
    // Remove o status do final e os underlines
    const base = filename.substring(0, filename.lastIndexOf('_'));
    return base.replace(/_/g, ' ');
  };

  const getStatus = (filename: string): 'passed' | 'failed' | 'unknown' => {
    const base = filename.substring(filename.lastIndexOf('_') + 1, filename.lastIndexOf('.'));
    if (base === 'passed') return 'passed';
    if (base === 'failed') return 'failed';
    return 'unknown';
  };

  screenshots.forEach(file => {
    const scenarioName = getScenarioDisplayName(file);
    const status = getStatus(file);
    artifactsMap.set(scenarioName, {
      scenarioName,
      status,
      screenshotUrl: `/e2e/screenshots/${file}`,
      videoUrl: null
    });
  });

  videos.forEach(file => {
    const scenarioName = getScenarioDisplayName(file);
    const status = getStatus(file);
    const existing = artifactsMap.get(scenarioName);
    if (existing) {
      existing.videoUrl = `/e2e/videos/${file}`;
    } else {
      artifactsMap.set(scenarioName, {
        scenarioName,
        status,
        screenshotUrl: null,
        videoUrl: `/e2e/videos/${file}`
      });
    }
  });

  const testArtifacts = Array.from(artifactsMap.values());
  const totalTests = testArtifacts.length;
  const passedTests = testArtifacts.filter(t => t.status === 'passed').length;
  const failedTests = testArtifacts.filter(t => t.status === 'failed').length;

  return (
    <div className="max-w-6xl mx-auto py-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Relatório de Testes E2E</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Último Commit
            </span>
          </div>
          <p className="text-gray-500 mt-1">Artefatos visuais capturados dinamicamente a partir da execução do Playwright.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-mono">
            pnpm --filter web test:e2e
          </span>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Cenários Executados</div>
          <div className="text-4xl font-extrabold text-gray-800 mt-2">{totalTests}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Passaram com Sucesso</div>
          <div className="text-4xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
            {passedTests}
            {totalTests > 0 && passedTests === totalTests && (
              <span className="text-lg bg-emerald-50 text-emerald-600 p-1 rounded-full">🏆</span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Falharam</div>
          <div className={`text-4xl font-extrabold mt-2 ${failedTests > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
            {failedTests}
          </div>
        </div>
      </div>

      {/* Sem artefatos */}
      {totalTests === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-700">Nenhum artefato encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Execute os testes E2E localmente ou via pre-push para gerar automaticamente novos screenshots e vídeos na pasta <code>public/e2e</code>.
          </p>
        </div>
      )}

      {/* Grid de Testes */}
      <div className="grid grid-cols-1 gap-8">
        {testArtifacts.map((test, index) => (
          <div 
            key={index} 
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300"
          >
            {/* Header do Cenário */}
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">Cenário {index + 1}</span>
                <h2 className="text-xl font-bold text-gray-800">{test.scenarioName}</h2>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${
                test.status === 'passed' 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-rose-500 text-white shadow-rose-200'
              }`}>
                {test.status === 'passed' ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            {/* Artefatos Visuais */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vídeo */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    🎥 Gravação da Execução
                  </h3>
                  {test.videoUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-gray-900">
                      <video 
                        src={test.videoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-sm">
                      <span>Vídeo não disponível para este cenário</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  * Gravação em tempo real capturada a partir do navegador headless do Playwright.
                </div>
              </div>

              {/* Screenshot */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📸 Screenshot Final
                  </h3>
                  {test.screenshotUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm group">
                      <a href={test.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                        <img 
                          src={test.screenshotUrl} 
                          alt={`Screenshot de ${test.scenarioName}`}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition duration-300">
                          <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition duration-300 shadow">
                            Ver em tela cheia ↗
                          </span>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-sm">
                      <span>Screenshot não disponível para este cenário</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  * Captura de tela inteira (Full Page) contendo o estado da interface no momento em que o teste finalizou.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
