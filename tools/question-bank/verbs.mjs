// Tradução revisada dos verbos das provas e conjugador do português.
// Formas: pres (ele/ela), past (ele/ela), part (particípio), ger (gerúndio).
export const VERBS = {
  write:['escrever'], begin:['começar'], bring:['trazer'], build:['construir'], catch:['pegar'], choose:['escolher'],
  fight:['lutar'], entertain:['divertir'], get:['conseguir','obter'], give:['dar'], go:['ir'], hold:['segurar'], hide:['esconder'],
  have:['ter'], hear:['ouvir','escutar'], keep:['manter'], know:['saber','conhecer'], learn:['aprender'], lose:['perder'],
  make:['fazer'], mean:['significar','querer dizer'], sleep:['dormir'], say:['dizer'], see:['ver'], sell:['vender'], send:['enviar'],
  show:['mostrar'], slide:['deslizar'], speak:['falar'], spend:['gastar','passar'], take:['levar','pegar'], teach:['ensinar'],
  tell:['contar','dizer'], think:['pensar'], throw:['jogar','atirar'], live:['viver','morar'], marry:['casar-se'], amaze:['surpreender'],
  compel:['obrigar'], argue:['discutir'], assume:['supor','assumir'], pass:['passar'], clothe:['vestir'], hang:['pendurar'], unite:['unir'],
  remove:['remover'], dance:['dançar'], use:['usar'], treat:['tratar'], interest:['interessar'], move:['mover','mudar-se'],
  work:['trabalhar','funcionar'], bind:['unir','amarrar'], blur:['embaçar'], warn:['avisar'], cover:['cobrir'], plan:['planejar'], create:['criar'],
  change:['mudar'], serve:['servir'], place:['colocar'], point:['apontar'], note:['notar'], plant:['plantar'], rate:['avaliar'],
  put:['colocar','pôr'], turn:['virar'], continue:['continuar'], suppose:['supor'], expect:['esperar'], retire:['aposentar-se'], melt:['derreter'],
  set:['definir','pôr'], understand:['entender'], grow:['crescer'], provide:['fornecer'], snort:['bufar'], arrive:['chegar'], construct:['construir'],
  want:['querer'], wear:['usar','vestir'], wire:['ligar'], rise:['subir'], swamp:['inundar'], benefit:['beneficiar'], warm:['aquecer'],
  disappoint:['decepcionar'], coil:['enrolar'], pick:['escolher','pegar'], hunt:['caçar'], close:['fechar'], injure:['ferir'], cease:['cessar'],
  share:['compartilhar'], become:['tornar-se'], seem:['parecer'], look:['olhar','parecer'], walk:['andar','caminhar'], try:['tentar'], tear:['rasgar'],
  wish:['desejar'], pay:['pagar'], touch:['tocar'], dress:['vestir'], urge:['insistir'], crowd:['lotar'], descend:['descender'], assemble:['montar'],
  lock:['trancar'], curse:['xingar'], command:['comandar'], bother:['incomodar'], struggle:['lutar'], assert:['afirmar'], rub:['esfregar'], frame:['enquadrar'],
  sink:['afundar'], consider:['considerar'], blame:['culpar'], import:['importar'], slip:['escorregar'], boast:['ostentar'], clap:['aplaudir'],
  listen:['ouvir','escutar'], lack:['faltar'], pluck:['arrancar'], call:['chamar','ligar'], ask:['perguntar','pedir'], allow:['permitir'], comment:['comentar'],
  state:['afirmar'], contribute:['contribuir'], feed:['alimentar'], include:['incluir'], talk:['conversar','falar'], lead:['levar','liderar'], find:['encontrar','achar'],
  raise:['levantar','criar'], produce:['produzir'], name:['nomear'], require:['exigir'], force:['forçar'], finish:['terminar'], refuse:['recusar'], publish:['publicar'],
  suggest:['sugerir'], remain:['permanecer'], rule:['governar'], play:['jogar','tocar'], settle:['estabelecer-se'], seize:['agarrar'], address:['dirigir-se a'],
  win:['vencer','ganhar'], involve:['envolver'], perceive:['perceber'], affect:['afetar'], design:['projetar'], challenge:['desafiar'], study:['estudar'], dream:['sonhar'],
  grant:['conceder'], buy:['comprar'], like:['gostar de'], dishearten:['desanimar'], report:['relatar'], develop:['desenvolver'], switch:['trocar'], confront:['confrontar'],
  offer:['oferecer'], count:['contar'], deal:['lidar'], store:['guardar'], demand:['exigir'], bounce:['quicar'], visit:['visitar'], purchase:['comprar'], flood:['inundar'],
  quote:['citar'], replace:['substituir'], respect:['respeitar'], relax:['relaxar'], solve:['resolver'], hum:['cantarolar'], delete:['apagar'], pollute:['poluir'],
  promote:['promover'], announce:['anunciar'], transform:['transformar'], support:['apoiar'], frustrate:['frustrar'], obsess:['obcecar'], explain:['explicar'], care:['importar-se'],
  believe:['acreditar'], score:['marcar'], bathe:['banhar'], increase:['aumentar'], remind:['lembrar'], update:['atualizar'], waste:['desperdiçar'], mix:['misturar'],
  inspire:['inspirar'], decide:['decidir'], strengthen:['fortalecer'], intensify:['intensificar'], ruin:['arruinar'], risk:['arriscar'], toss:['jogar'], polish:['polir'],
  invite:['convidar'], shrink:['encolher'], reduce:['reduzir'], highlight:['destacar'], exile:['exilar'], assess:['avaliar'], align:['alinhar'], reclaim:['recuperar'],
  coax:['persuadir'], educate:['educar'], migrate:['migrar'], loosen:['afrouxar'], comb:['pentear'], demean:['humilhar'], undermine:['enfraquecer'], dominate:['dominar'],
  eradicate:['erradicar'], waddle:['bambolear'], emerge:['surgir'], salute:['saudar'], emigrate:['emigrar'], incinerate:['incinerar'], perpetuate:['perpetuar'],
  revolutionize:['revolucionar'], diminish:['diminuir'], trek:['caminhar'], crawl:['rastejar'], mortify:['envergonhar'], misguide:['enganar'], showcase:['exibir'], cluster:['agrupar'],
  section:['dividir'], code:['programar'], date:['namorar'], mind:['importar-se'], hand:['entregar'], merit:['merecer'], limit:['limitar'], age:['envelhecer'], face:['enfrentar'],
  leave:['deixar','sair'], feel:['sentir'], read:['ler'], do:['fazer'], stand:['ficar de pé'], strike:['atingir'], lie:['mentir','estar deitado'], underlie:['fundamentar'], gear:['preparar'],
  break:['quebrar'], bite:['morder'], estimate:['estimar'], prompt:['motivar'], express:['expressar'], spot:['avistar','notar'], top:['superar'], don:['vestir'], jar:['chocar'],
  lecture:['palestrar'], calm:['acalmar'], bond:['unir'], labor:['trabalhar'], lace:['misturar'], nurse:['cuidar de'], house:['abrigar'], market:['comercializar'], mine:['minerar'],
  foul:['sujar'], word:['formular'], frighten:['assustar'], laugh:['rir'], fall:['cair'], open:['abrir'], sing:['cantar'], swim:['nadar'], drive:['dirigir'], eat:['comer'], drink:['beber'], run:['correr'], die:['morrer'], come:['vir'], cut:['cortar'], meet:['encontrar'],
};

const IRR = {
  ser:['é','foi','sido','sendo'], estar:['está','esteve','estado','estando'], ter:['tem','teve','tido','tendo'], ir:['vai','foi','ido','indo'], vir:['vem','veio','vindo','vindo'],
  ver:['vê','viu','visto','vendo'], dar:['dá','deu','dado','dando'], fazer:['faz','fez','feito','fazendo'], dizer:['diz','disse','dito','dizendo'], trazer:['traz','trouxe','trazido','trazendo'],
  saber:['sabe','soube','sabido','sabendo'], poder:['pode','pôde','podido','podendo'], querer:['quer','quis','querido','querendo'], 'pôr':['põe','pôs','posto','pondo'], supor:['supõe','supôs','suposto','supondo'],
  ler:['lê','leu','lido','lendo'], manter:['mantém','manteve','mantido','mantendo'], sair:['sai','saiu','saído','saindo'], cair:['cai','caiu','caído','caindo'], rir:['ri','riu','rido','rindo'],
  subir:['sobe','subiu','subido','subindo'], construir:['constrói','construiu','construído','construindo'], cobrir:['cobre','cobriu','coberto','cobrindo'], abrir:['abre','abriu','aberto','abrindo'],
  obter:['obtém','obteve','obtido','obtendo'], polir:['pule','poliu','polido','polindo'], saudar:['saúda','saudou','saudado','saudando'], arruinar:['arruína','arruinou','arruinado','arruinando'],
  escrever:['escreve','escreveu','escrito','escrevendo'], morrer:['morre','morreu','morto','morrendo'], ficar:['fica','ficou','ficado','ficando'],
};
const PART = { pagar:'pago', ganhar:'ganho', gastar:'gasto', pegar:'pego', entregar:'entregue', aceitar:'aceito' };

function regular(v) {
  if (v.endsWith('ear')) { const r = v.slice(0, -3); return [r + 'eia', r + 'eou', r + 'eado', r + 'eando']; }
  if (v.endsWith('ar')) { const r = v.slice(0, -2); return [r + 'a', r + 'ou', PART[v] || r + 'ado', r + 'ando']; }
  if (v.endsWith('er')) { const r = v.slice(0, -2); return [r + 'e', r + 'eu', r + 'ido', r + 'endo']; }
  if (/uzir$/.test(v)) { const r = v.slice(0, -2); return [r, r + 'iu', r + 'ido', r + 'indo']; }
  if (/[^g]uir$/.test(v)) { const r = v.slice(0, -2); return [r + 'i', r + 'iu', r + 'ído', r + 'indo']; }
  if (v.endsWith('ir')) { const r = v.slice(0, -2); return [r + 'e', r + 'iu', r + 'ido', r + 'indo']; }
  throw new Error('verbo desconhecido: ' + v);
}

export function conjugate(inf) {
  const [head, ...rest] = inf.split(' ');
  const refl = head.endsWith('-se');
  const v = refl ? head.slice(0, -3) : head;
  const [pres, past, part, ger] = IRR[v] || regular(v);
  const tail = rest.length ? ' ' + rest.join(' ') : '';
  const s = refl ? '-se' : '';
  return { pres: pres + s + tail, past: past + s + tail, part: part + tail, ger: ger + s + tail };
}

// Tipo de forma a partir da definição do Wiktionary ("simple past and past participle of hear").
export function kinds(gloss) {
  const g = gloss.toLowerCase();
  if (/obsolete|archaic|dialect|nonstandard|eye dialect/.test(g)) return [];
  if (/third-person singular/.test(g) && /present/.test(g)) return ['pres'];
  if (/first-person|second-person|plural/.test(g)) return [];
  const out = [];
  if (/simple past|^past\b/.test(g) && !/past participle of/.test(g.replace(/simple past and past participle/, 'x'))) out.push('past');
  if (/past participle/.test(g)) out.push('part');
  if (/present participle|gerund/.test(g)) out.push('ger');
  return [...new Set(out)];
}
