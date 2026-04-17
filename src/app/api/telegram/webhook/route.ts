import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: number, text: string) {
  if (!TELEGRAM_TOKEN) return;
  
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar que el cuerpo tiene el formato de Telegram
    if (!body.message || !body.message.chat || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.toLowerCase().trim();

    // Comando: /start
    if (text === "/start") {
      const welcomeMsg = `🦾 *Bienvenido a PulsoOdds Bot* ⚡️\n\nSoy tu asistente de picks en tiempo real. Aquí podrás consultar los pronósticos actuales de la plataforma directamente desde Telegram.\n\n📚 *Comandos disponibles:*\n/picks - Ver pronósticos actuales\n/ayuda - Ver guía de uso`;
      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // Comando: /ayuda
    if (text === "/ayuda") {
      const helpMsg = `❓ *Guía de Ayuda*\n\nUsa /picks para recibir una lista filtrada de todos los partidos que tenemos analizados y pendientes por jugar.\n\nPara resultados pasados y estadísticas detalladas (ROI/Yield), visita nuestra web oficial: [pulsoodds.com](https://pulsoodds.com)`;
      await sendTelegramMessage(chatId, helpMsg);
      return NextResponse.json({ ok: true });
    }

    // Comando: /picks
    if (text === "/picks") {
      const { data: pendingPicks, error } = await supabase
        .from("picks")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error || !pendingPicks || pendingPicks.length === 0) {
        await sendTelegramMessage(chatId, "⚠️ *No hay picks pendientes* en este momento. ¡Vuelve más tarde!");
        return NextResponse.json({ ok: true });
      }

      let message = `⚡️ *PRONÓSTICOS PENDIENTES* ⚡️\n\n`;
      
      pendingPicks.forEach((p, index) => {
        const date = p.match_date ? new Date(p.match_date).toLocaleDateString("es-ES") : "Hoy";
        message += `${index + 1}. ⚽️ *${p.match}*\n`;
        message += `🏆 ${p.competition}\n`;
        message += `🎯 Pick: *${p.pick}*\n`;
        message += `📈 Cuota: *${p.odds}* | 💎 Stake: *${p.stake}*\n`;
        message += `📅 Fecha: ${date}\n\n`;
      });

      message += `🔗 _Consulta el análisis completo en [pulsoodds.com](https://pulsoodds.com)_`;
      
      await sendTelegramMessage(chatId, message);
      return NextResponse.json({ ok: true });
    }

    // Si no reconoce el comando, no hacemos nada o mandamos ayuda personalizada
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
