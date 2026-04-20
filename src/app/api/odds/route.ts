import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Usamos 'soccer_germany_bundesliga' como ejemplo de deporte si no viene nada, 
  // ya que sabemos que estás trabajando con ese mercado.
  const sport = searchParams.get('sport') || 'soccer_germany_bundesliga';
  const regions = 'eu'; 
  const markets = 'h2h,btts'; 
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Falta la API KEY de Odds-API en el servidor' }, { status: 400 });
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&apiKey=${apiKey}`;
    let response = await fetch(url);
    
    // Si la respuesta no es OK y el error menciona 'btts', reintentamos solo con 'h2h'
    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.message || '';
      
      if (errorMsg.toLowerCase().includes('btts')) {
        const retryUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=h2h&apiKey=${apiKey}`;
        response = await fetch(retryUrl);
        
        if (!response.ok) {
          const retryErrorData = await response.json();
          return NextResponse.json({ error: retryErrorData.message || 'Error en reintento de API' }, { status: response.status });
        }
      } else {
        return NextResponse.json({ error: errorMsg || 'Error en la respuesta de la API' }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión con el proveedor de cuotas' }, { status: 500 });
  }
}
