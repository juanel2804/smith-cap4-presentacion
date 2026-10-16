import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, random} from 'remotion';

const INK = '#14213d';
const GOLD = '#c8963e';
const GOLD2 = '#e6c07b';
const CREAM = '#f7f0df';
const WINE = '#7a1f2b';
const SAGE = '#3d6b5c';
const SERIF = '"Palatino Linotype","Book Antiqua",Georgia,serif';
const SANS = '"Segoe UI",Calibri,Arial,sans-serif';
const EMOJI = '"Segoe UI Emoji","Apple Color Emoji",sans-serif';

const INTRO = 80; // frames de la tarjeta de título estilo cine
const STEP = 28; // frames entre elementos

type Particle = {emoji: string[]; mode: 'fall' | 'rise' | 'drift'};

const useReveal = (i: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = INTRO + 8 + i * STEP;
  const s = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 110}});
  return {opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + 0.08 * s})`};
};

const Particles: React.FC<{p: Particle; seed: string}> = ({p, seed}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(16).fill(0).map((_, n) => {
        const delay = random(seed + 'd' + n) * 25;
        const dur = 45 + random(seed + 'u' + n) * 30;
        const t = interpolate(frame - delay, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const x0 = random(seed + 'x' + n) * 1180;
        const y0 = 60 + random(seed + 'y' + n) * 520;
        let x = x0, y = 0, o = Math.sin(t * Math.PI);
        if (p.mode === 'fall') y = -100 + t * 860;
        if (p.mode === 'rise') y = 780 - t * 900;
        if (p.mode === 'drift') { x = -120 + t * 1500; y = y0 + Math.sin(t * 6) * 30; }
        return (
          <div key={n} style={{position: 'absolute', left: x, top: y, fontSize: 48, opacity: o, fontFamily: EMOJI, transform: `rotate(${t * 300}deg)`}}>
            {p.emoji[n % p.emoji.length]}
          </div>
        );
      })}
    </>
  );
};

const Card: React.FC<{kicker: string; title: string; p: Particle; seed: string}> = ({kicker, title, p, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bars = interpolate(frame, [0, 18, INTRO - 20, INTRO], [0, 92, 92, 0], {extrapolateRight: 'clamp'});
  const op = interpolate(frame, [0, 12, INTRO - 22, INTRO], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const tit = spring({frame: frame - 14, fps, config: {damping: 15}});
  const R = interpolate(frame, [0, 22], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op, clipPath: `circle(${R * 1.5}% at 50% 50%)`, background: `radial-gradient(circle at 50% 45%,#16264a 0,#05070f 70%)`}}>
      <Particles p={p} seed={seed} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bars, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bars, background: '#000'}} />
      <div style={{position: 'absolute', left: 90, right: 90, top: '50%', transform: `translateY(-50%)`, textAlign: 'center'}}>
        <div style={{font: `700 20px ${SANS}`, letterSpacing: '0.4em', color: GOLD, textTransform: 'uppercase', marginBottom: 16, opacity: tit}}>{kicker}</div>
        <div style={{font: `700 60px/1.1 ${SERIF}`, color: CREAM, transform: `translateY(${(1 - tit) * 40}px) scale(${0.94 + 0.06 * tit})`, textShadow: '0 4px 30px #000'}}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

const Frame: React.FC<{kicker: string; title: string; dark?: boolean; children: React.ReactNode; note?: string}> = ({kicker, title, dark, children, note}) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [INTRO - 20, INTRO + 70], [1.07, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blur = interpolate(frame, [INTRO - 20, INTRO + 40], [8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const drift = frame * 0.4;
  return (
    <AbsoluteFill
      style={{
        background: dark ? `radial-gradient(circle at 80% 20%,#27407a 0,${INK} 60%)` : `radial-gradient(circle at ${100 - drift * 0.05}% 0,#f1e4c5 0,transparent 45%),#fffaf0`,
        color: dark ? CREAM : INK,
        padding: '54px 80px',
        transform: `scale(${push})`,
        filter: `blur(${blur}px)`,
      }}
    >
      <div style={{font: `700 16px ${SANS}`, letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase'}}>{kicker}</div>
      <div style={{font: `700 46px/1.1 ${SERIF}`, margin: '8px 0 0'}}>{title}</div>
      <div style={{width: 90, height: 4, background: dark ? GOLD2 : GOLD, margin: '14px 0 22px'}} />
      {children}
      {note && <div style={{position: 'absolute', left: 80, bottom: 20, font: `14px ${SANS}`, opacity: 0.6}}>{note}</div>}
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{i: number; children: React.ReactNode; style?: React.CSSProperties}> = ({i, children, style}) => {
  const st = useReveal(i);
  return <div style={{...st, ...style}}>{children}</div>;
};

const CardBox: React.FC<{i: number; head: string; text?: string; tag?: string; color?: string; dark?: boolean}> = ({i, head, text, tag, color, dark}) => (
  <Reveal i={i}>
    <div style={{background: dark ? INK : '#fff', color: dark ? CREAM : INK, border: '1px solid #e6d9b8', borderTop: `6px solid ${color || GOLD}`, borderRadius: 12, padding: '18px 22px', boxShadow: '0 8px 22px #14213d22', height: '100%'}}>
      {tag && <span style={{font: `700 14px ${SANS}`, letterSpacing: '.08em', textTransform: 'uppercase', background: color || INK, color: '#fff', padding: '3px 11px', borderRadius: 20}}>{tag}</span>}
      <div style={{font: `700 30px ${SERIF}`, margin: '8px 0 4px'}}>{head}</div>
      {text && <div style={{font: `24px/1.35 ${SANS}`}}>{text}</div>}
    </div>
  </Reveal>
);

const Bullets: React.FC<{items: React.ReactNode[]; start?: number}> = ({items, start = 0}) => (
  <div>
    {items.map((t, k) => (
      <Reveal i={start + k} key={k} style={{font: `30px/1.35 ${SANS}`, padding: '12px 0 12px 42px', position: 'relative'}}>
        <div style={{position: 'absolute', left: 4, top: 26, width: 15, height: 15, background: GOLD, transform: 'rotate(45deg)'}} />
        {t}
      </Reveal>
    ))}
  </div>
);

const Quote: React.FC<{i: number; text: string; src: string; dark?: boolean}> = ({i, text, src, dark}) => (
  <Reveal i={i} style={{borderLeft: `6px solid ${GOLD}`, paddingLeft: 24, marginTop: 22}}>
    <div style={{font: `italic 30px/1.4 ${SERIF}`, color: dark ? CREAM : '#1d2f55'}}>{text}</div>
    <div style={{font: `15px ${SANS}`, opacity: 0.65, marginTop: 6}}>{src}</div>
  </Reveal>
);

const FlowRow: React.FC<{items: {a: string; b?: string; hi?: boolean}[]; start?: number}> = ({items, start = 0}) => (
  <div style={{display: 'flex', gap: 14, alignItems: 'stretch'}}>
    {items.map((it, k) => (
      <Reveal i={start + k} key={k} style={{flex: 1}}>
        <div style={{height: 120, borderRadius: 14, background: it.hi ? INK : '#fff', color: it.hi ? GOLD2 : INK, border: `3px solid ${GOLD}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: 10}}>
          <div style={{font: `700 24px ${SANS}`}}>{it.a}</div>
          {it.b && <div style={{font: `18px ${SANS}`, opacity: 0.8, marginTop: 4}}>{it.b}</div>}
        </div>
        {k < items.length - 1 && null}
      </Reveal>
    ))}
  </div>
);

// ---------- Escenas ----------
type SceneDef = {id: string; kicker: string; title: string; p: Particle; dark?: boolean; n: number; render: () => React.ReactNode; note?: string};

const bar = (frame: number, start: number, pct: number, w = 400) => {
  const k = interpolate(frame, [start, start + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return w * pct * k;
};

const Degradacion: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['Inglaterra', 1 / 3, '1/3'],
    ['Roma (el as)', 1 / 24, '1/24'],
    ['Escocia', 1 / 36, '1/36'],
    ['Francia', 1 / 66, '1/66'],
  ] as const;
  return (
    <div style={{display: 'flex', gap: 50}}>
      <div style={{width: 560}}>
        <div style={{font: `700 22px ${SANS}`, marginBottom: 14}}>Parte del valor original que conserva la unidad</div>
        {rows.map((r, k) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', margin: '18px 0'}}>
            <div style={{width: 140, font: `22px ${SANS}`}}>{r[0]}</div>
            <div style={{width: 360, height: 34, background: '#f2e3bd', borderRadius: 4}}>
              <div style={{width: Math.max(bar(frame, INTRO + 10 + k * 18, r[1] as number, 360), 0), height: 34, background: k === 3 ? WINE : GOLD, borderRadius: 4}} />
            </div>
            <div style={{marginLeft: 12, font: `700 22px ${SANS}`}}>{r[2]}</div>
          </div>
        ))}
        <div style={{font: `15px ${SANS}`, opacity: 0.6}}>Barra completa = 100 % del metal original. Datos de Smith.</div>
      </div>
      <div style={{flex: 1}}>
        <Quote i={4} text="«…la avaricia e injusticia de los príncipes y estados soberanos, abusando de la confianza de sus súbditos»" src="Smith, cap. IV (traducción usada)" />
        <Reveal i={6} style={{marginTop: 22, font: `26px/1.4 ${SANS}`}}>
          <b>Efecto aparente:</b> el Estado paga con menos plata.<br />
          <b>Efecto real:</b> «favorables para los deudores y ruinosas para los acreedores».
        </Reveal>
      </div>
    </div>
  );
};

const Trueque: React.FC = () => (
  <div style={{display: 'flex', gap: 40, alignItems: 'center'}}>
    <svg viewBox="0 0 560 360" width={560} height={360}>
      <circle cx={280} cy={70} r={66} fill={INK} />
      <text x={280} y={66} textAnchor="middle" fill={GOLD2} fontWeight={700} fontSize={22} fontFamily={SANS}>Carnicero</text>
      <text x={280} y={90} textAnchor="middle" fill={GOLD2} fontSize={15} fontFamily={SANS}>carne de sobra</text>
      <circle cx={90} cy={290} r={58} fill="#fff" stroke={GOLD} strokeWidth={3} />
      <text x={90} y={290} textAnchor="middle" fontWeight={700} fontSize={19} fontFamily={SANS} fill={INK}>Cervecero</text>
      <circle cx={470} cy={290} r={58} fill="#fff" stroke={GOLD} strokeWidth={3} />
      <text x={470} y={290} textAnchor="middle" fontWeight={700} fontSize={19} fontFamily={SANS} fill={INK}>Panadero</text>
      <line x1={135} y1={250} x2={235} y2={120} stroke={WINE} strokeWidth={3} strokeDasharray="8 6" />
      <line x1={425} y1={250} x2={325} y2={120} stroke={WINE} strokeWidth={3} strokeDasharray="8 6" />
      <text x={170} y={200} fontSize={46} fill={WINE} fontWeight={700}>✕</text>
      <text x={360} y={200} fontSize={46} fill={WINE} fontWeight={700}>✕</text>
      <text x={280} y={335} textAnchor="middle" fontSize={17} fill={WINE} fontWeight={700} fontFamily={SANS}>El carnicero ya tiene pan y cerveza</text>
    </svg>
    <div style={{flex: 1}}>
      <Bullets items={[<>Ambos <b>quieren</b> carne.</>, <>Solo pagan con <b>sus propios productos</b>.</>, <>Todos quedan «recíprocamente menos útiles».</>]} />
      <Reveal i={3} style={{marginTop: 14, background: '#fff', border: `1px solid #e6d9b8`, borderLeft: `6px solid ${GOLD}`, padding: '14px 18px', font: `22px/1.35 ${SANS}`, borderRadius: 8}}>
        Hoy se llama <i>doble coincidencia de deseos</i> (Jevons, 1875). Smith describe el problema sin ese nombre.
      </Reveal>
    </div>
  </div>
);

const Metales: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [INTRO + 100, INTRO + 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', gap: 40}}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
        <CardBox i={0} head="1 · Durables" text="«Casi no hay nada menos perecedero»." />
        <CardBox i={1} head="2 · Divisibles sin pérdida" text="Se parten en la cantidad exacta." />
        <CardBox i={2} head="3 · Refundibles" text="Las partes vuelven a ser una pieza." />
      </div>
      <Reveal i={3} style={{flex: 1.05, font: `20px ${SANS}`}}>
        <b style={{fontSize: 24}}>Comprar sal con ganado</b>
        <div style={{display: 'flex', gap: 10, margin: '12px 0'}}>
          {['1 buey', '2 bueyes', '3 bueyes'].map((t) => (
            <div key={t} style={{background: WINE, color: '#fff', padding: '10px 14px', borderRadius: 6, font: `18px ${SANS}`}}>{t}</div>
          ))}
        </div>
        <div style={{opacity: 0.7, fontSize: 18}}>Solo se paga «por bloques».</div>
        <b style={{fontSize: 24, display: 'block', marginTop: 30}}>Comprar sal con metal</b>
        <div style={{margin: '12px 0', height: 40, width: 380, background: '#f2e3bd', borderRadius: 6}}>
          <div style={{height: 40, width: 380 * 0.43 * k, background: GOLD, borderRadius: 6}} />
        </div>
        <div style={{opacity: 0.7, fontSize: 18}}>Se ajusta «la cantidad precisa» que se necesita.</div>
      </Reveal>
    </div>
  );
};

const Valor: React.FC = () => (
  <div style={{display: 'flex', gap: 40, alignItems: 'center'}}>
    <Reveal i={0}>
      <svg viewBox="0 0 520 360" width={520} height={360}>
        <line x1={60} y1={310} x2={500} y2={310} stroke={INK} strokeWidth={2} />
        <line x1={60} y1={310} x2={60} y2={20} stroke={INK} strokeWidth={2} />
        <text x={280} y={346} textAnchor="middle" fontSize={17} fontFamily={SANS} fill={INK}>Valor de cambio (poder de compra)</text>
        <text transform="translate(22 165) rotate(-90)" textAnchor="middle" fontSize={17} fontFamily={SANS} fill={INK}>Valor de uso (utilidad)</text>
        <circle cx={130} cy={70} r={38} fill={SAGE} />
        <text x={130} y={76} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={16} fontFamily={SANS}>AGUA</text>
        <circle cx={430} cy={270} r={38} fill={GOLD} />
        <text x={430} y={275} textAnchor="middle" fill={INK} fontWeight={700} fontSize={13} fontFamily={SANS}>DIAMANTE</text>
      </svg>
    </Reveal>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
      <CardBox i={1} head="Valor de uso" text="La utilidad de un objeto." tag="Uso" />
      <CardBox i={2} head="Valor de cambio" text="El poder de compra de otros bienes que da poseerlo." tag="Cambio" color={WINE} />
      <Quote i={3} text="«No hay nada más útil que el agua, pero con ella casi no se puede comprar nada»" src="Smith, cap. IV (traducción usada)" />
    </div>
  </div>
);

const SCENES: SceneDef[] = [
  {id: 'pregunta', kicker: 'Para empezar', title: 'Si pagaras tacos con una vaca… ¿cómo te darían el cambio?', p: {emoji: ['🐄', '🌮', '🥩'], mode: 'drift'}, dark: true, n: 2,
    render: () => (
      <>
        <Reveal i={0} style={{font: `700 60px/1.15 ${SERIF}`, marginTop: 40}}>Si pagaras un par de tacos con una vaca…</Reveal>
        <Reveal i={1} style={{font: `700 60px/1.15 ${SERIF}`, color: GOLD2, marginTop: 10}}>¿cómo te darían el cambio?</Reveal>
        <Reveal i={2} style={{font: `30px ${SANS}`, opacity: 0.8, marginTop: 40}}>Esa pregunta es el corazón del capítulo 4.</Reveal>
      </>
    )},
  {id: 'tesis', kicker: 'Tesis central', title: 'El dinero nace de una necesidad práctica, no de un decreto', p: {emoji: ['💡', '🪙', '🏛️'], mode: 'rise'}, n: 4,
    render: () => (
      <>
        <div style={{display: 'flex', gap: 22, marginTop: 20}}>
          <div style={{flex: 1}}><CardBox i={0} head="El trueque se atasca" text="Con división del trabajo, casi todo se obtiene intercambiando." tag="1 · Problema" /></div>
          <div style={{flex: 1}}><CardBox i={1} head="Mercancía aceptada por todos" text="Las personas prudentes la buscan; los metales son la mejor." tag="2 · Solución" color={SAGE} /></div>
          <div style={{flex: 1}}><CardBox i={2} head="El sello público" text="La moneda certifica peso y finura; los soberanos la degradan." tag="3 · Institución" color={WINE} /></div>
        </div>
        <Reveal i={3} style={{font: `32px ${SANS}`, marginTop: 36}}>De ahí surge la pregunta: <b style={{color: WINE}}>¿qué determina el valor de cambio?</b></Reveal>
      </>
    )},
  {id: 'trueque', kicker: 'El problema', title: 'Cuando el trueque se atasca', p: {emoji: ['🥩', '🍺', '🍞', '🤝'], mode: 'drift'}, n: 5, render: () => <Trueque />, note: 'Ejemplo del autor'},
  {id: 'metales', kicker: 'La solución privada', title: 'Por qué los metales vencieron a las demás mercancías', p: {emoji: ['⛏️', '🪙', '⚖️', '🔗'], mode: 'rise'}, n: 5, render: () => <Metales />},
  {id: 'sello', kicker: 'Solución institucional', title: 'El sello público: del peso a la cuenta', p: {emoji: ['🏛️', '🪙', '🔏', '⚜️'], mode: 'fall'}, n: 7,
    render: () => (
      <>
        <FlowRow items={[{a: 'Barra sin sello', b: 'se recibe por peso'}, {a: 'Sello de finura', b: 'certifica pureza, no peso'}, {a: 'Moneda', b: 'finura y peso garantizados'}, {a: 'Por cuenta', b: 'sin pesarla', hi: true}]} />
        <div style={{display: 'flex', gap: 22, marginTop: 26}}>
          <div style={{flex: 1}}><CardBox i={4} head="Función" text="Prevenir abusos y estimular «todas las clases de industria y comercio»." /></div>
          <div style={{flex: 1}}><CardBox i={5} head="Analogía de Smith" text="La ceca es como el control de calidad de tejidos de lana y de hilo." /></div>
          <div style={{flex: 1}}><CardBox i={6} head="Ejemplo bíblico" text="Abraham pesó a Efrón 400 siclos de plata." /></div>
        </div>
      </>
    )},
  {id: 'degradacion', kicker: 'La crítica política del capítulo', title: 'Cuando el soberano rebaja la moneda', p: {emoji: ['🔥', '📉', '💸', '⚠️'], mode: 'rise'}, n: 7, render: () => <Degradacion />},
  {id: 'valor', kicker: 'El giro del capítulo', title: '«Valor» significa dos cosas distintas', p: {emoji: ['💧', '💎', '💧', '💎'], mode: 'fall'}, n: 5, render: () => <Valor />},
  {id: 'hilo', kicker: 'Relaciones entre las ideas', title: 'El hilo argumental del capítulo', p: {emoji: ['🧭', '🧩', '🔗'], mode: 'drift'}, n: 8,
    render: () => (
      <>
        <FlowRow start={0} items={[{a: 'División del trabajo'}, {a: 'Excedente a cambiar'}, {a: 'Trueque atascado'}, {a: 'Mercancía aceptada'}]} />
        <div style={{height: 22}} />
        <FlowRow start={4} items={[{a: 'Metales'}, {a: 'Pesar y contrastar'}, {a: 'Sello = moneda'}, {a: 'Degradación'}]} />
        <Reveal i={8} style={{marginTop: 24, background: GOLD, color: INK, borderRadius: 12, padding: '18px 24px', font: `700 30px ${SERIF}`, textAlign: 'center'}}>Dinero universal → valor de uso ≠ valor de cambio → caps. 5, 6 y 7</Reveal>
      </>
    )},
  {id: 'contraste', kicker: 'Ideas originales vs. lecturas posteriores', title: 'Smith frente a otros pensamientos', p: {emoji: ['📚', '🎓', '💭'], mode: 'drift'}, n: 5,
    render: () => (
      <div>
        {[
          ['Menger (1892)', 'Coincide en el origen espontáneo del dinero; lo explica con la «vendibilidad».'],
          ['Jevons (1875)', 'Nombra el obstáculo del trueque: «doble coincidencia de deseos».'],
          ['Marginalistas', 'Resuelven la paradoja agua-diamante con la utilidad marginal.'],
          ['Marx (1867)', 'Retoma uso y cambio, pero funda el valor en el trabajo socialmente necesario.'],
          ['Graeber (2011)', 'Critica el relato «trueque → dinero» y propone el crédito como origen.'],
        ].map((r, k) => (
          <Reveal i={k} key={k} style={{display: 'flex', gap: 24, padding: '13px 18px', background: k % 2 ? '#fbf4e2' : '#fff', borderBottom: '1px solid #e6d9b8'}}>
            <div style={{width: 230, font: `700 25px ${SERIF}`}}>{r[0]}</div>
            <div style={{flex: 1, font: `24px/1.3 ${SANS}`}}>{r[1]}</div>
          </Reveal>
        ))}
      </div>
    )},
  {id: 'conclusiones', kicker: 'Conclusiones', title: 'Lo que nos llevamos', p: {emoji: ['✨', '🏆', '💡'], mode: 'rise'}, dark: true, n: 5,
    render: () => (
      <Bullets items={[
        <>La <b>división del trabajo</b> vuelve indispensable el intercambio.</>,
        <>El <b>trueque</b> falla cuando los deseos no coinciden.</>,
        <>El dinero surge de buscar <b>aceptación general</b>; los metales cumplen mejor.</>,
        <>La <b>acuñación</b> baja costos, pero depende de la <b>confianza</b> en quien sella.</>,
        <><b>Valor de uso ≠ valor de cambio</b>: la pregunta de los caps. 5–7.</>,
      ]} />
    )},
  {id: 'preguntas', kicker: 'Para el grupo', title: 'Preguntas y mini actividad', p: {emoji: ['❓', '💬', '🙋'], mode: 'rise'}, n: 4,
    render: () => (
      <>
        <CardBox i={0} head="Si el salón necesitara un dinero propio, ¿qué objeto elegirían?" text="Evalúenlo: durable, divisible, aceptado por todos, difícil de falsificar." tag="Actividad" color={WINE} />
        <div style={{height: 14}} />
        <Bullets start={1} items={['¿Por qué los soberanos degradan la moneda?', '¿Importa más hoy el sello de confianza que el metal?', '¿Resuelve la utilidad marginal la paradoja del agua y el diamante?']} />
      </>
    )},
  {id: 'fuentes', kicker: 'Referencias (APA 7.ª ed.)', title: 'Fuentes', p: {emoji: ['📖', '📚', '🖋️'], mode: 'rise'}, n: 3,
    render: () => (
      <div style={{font: `22px/1.4 ${SANS}`}}>
        <Reveal i={0}><b style={{color: WINE}}>Primaria</b><div style={{marginBottom: 12}}>Smith, A. (1776). <i>An inquiry into the nature and causes of the wealth of nations</i>. W. Strahan & T. Cadell.</div></Reveal>
        <Reveal i={1}>
          <b style={{color: SAGE}}>Secundarias</b>
          <div>Graeber, D. (2011). <i>Debt: The first 5,000 years</i>. Melville House.</div>
          <div>Jevons, W. S. (1875). <i>Money and the mechanism of exchange</i>. Henry S. King.</div>
          <div>Marx, K. (1867). <i>Das Kapital</i> (Vol. 1). Otto Meissner.</div>
          <div>Menger, C. (1892). On the origin of money. <i>The Economic Journal, 2</i>(6), 239–255.</div>
          <div>Radford, R. A. (1945). The economic organisation of a P.O.W. camp. <i>Economica, 12</i>(48), 189–201.</div>
        </Reveal>
      </div>
    )},
];

const len = (s: SceneDef) => INTRO + 8 + s.n * STEP + 120;
const COVER = 220;
const END = 150;
export const TOTAL_FRAMES = COVER + SCENES.reduce((a, s) => a + len(s), 0) + END;

const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = (d: number) => spring({frame: frame - d, fps, config: {damping: 16}});
  const coin = spring({frame, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 80% 20%,#27407a 0,${INK} 60%)`, color: CREAM, padding: '0 90px', justifyContent: 'center'}}>
      <Particles p={{emoji: ['🪙', '📜', '⚜️'], mode: 'fall'}} seed="cover" />
      <svg width={300} height={300} viewBox="0 0 300 300" style={{position: 'absolute', right: 90, top: 140, transform: `rotateY(${(1 - coin) * 540}deg) scale(${coin})`}}>
        <circle cx={150} cy={150} r={140} fill="none" stroke={GOLD} strokeWidth={3} />
        <circle cx={150} cy={150} r={124} fill="#c8963e22" stroke={GOLD2} strokeWidth={1.5} strokeDasharray="3 6" />
        <text x={150} y={134} textAnchor="middle" fontSize={60} fill={GOLD2} fontFamily="Georgia,serif" fontWeight={700}>1776</text>
        <line x1={80} y1={152} x2={220} y2={152} stroke={GOLD2} strokeWidth={2} />
        <text x={150} y={192} textAnchor="middle" fontSize={26} fill={GOLD2} fontFamily="Georgia,serif" letterSpacing={4}>LIBRO I</text>
        <text x={150} y={224} textAnchor="middle" fontSize={26} fill={GOLD2} fontFamily="Georgia,serif" letterSpacing={4}>CAP. IV</text>
      </svg>
      <div style={{font: `700 18px ${SANS}`, letterSpacing: '.25em', color: GOLD, textTransform: 'uppercase', opacity: s(10)}}>Historia del pensamiento económico</div>
      <div style={{font: `700 66px/1.05 ${SERIF}`, margin: '16px 0 8px', transform: `translateX(${(1 - s(20)) * -80}px)`, opacity: s(20)}}>Capítulo 4 de<br />La riqueza de las naciones</div>
      <div style={{font: `italic 36px ${SERIF}`, color: GOLD2, opacity: s(45)}}>«Del origen y uso del dinero»</div>
      <div style={{font: `24px/1.7 ${SANS}`, marginTop: 40, opacity: s(70)}}>
        <b>Autor de la obra:</b> Adam Smith<br />
        <b>Presenta:</b> José Manuel López García<br />
        <b>Fecha:</b> 16 de octubre de 2026
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 30, END - 30, END], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{background: '#05070f', justifyContent: 'center', alignItems: 'center', opacity: o}}>
      <Particles p={{emoji: ['🪙', '✨'], mode: 'rise'}} seed="end" />
      <div style={{font: `700 70px ${SERIF}`, color: CREAM}}>Gracias</div>
      <div style={{font: `26px ${SANS}`, color: GOLD2, marginTop: 14}}>¿Preguntas?</div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  let at = 0;
  const seqs: React.ReactNode[] = [];
  seqs.push(<Sequence key="cover" from={at} durationInFrames={COVER}><Cover /></Sequence>);
  at += COVER;
  SCENES.forEach((s) => {
    const d = len(s);
    seqs.push(
      <Sequence key={s.id} from={at} durationInFrames={d}>
        <AbsoluteFill style={{background: '#05070f'}}>
          <Frame kicker={s.kicker} title={s.title} dark={s.dark} note={s.note}>{s.render()}</Frame>
          <Card kicker={s.kicker} title={s.title} p={s.p} seed={s.id} />
        </AbsoluteFill>
      </Sequence>
    );
    at += d;
  });
  seqs.push(<Sequence key="end" from={at} durationInFrames={END}><End /></Sequence>);
  return <AbsoluteFill style={{background: '#05070f'}}>{seqs}</AbsoluteFill>;
};
