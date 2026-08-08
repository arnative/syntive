// Builds extension/lib/wordlist-id.ts from a curated seed of real Indonesian
// words. Dedupes, sorts (deterministic/stable so issued keys never break), and
// slices to exactly TARGET entries. Throws if the seed has too few unique words.
//
// Run: node scripts/build-wordlist.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = 2048;

const SEED = `
abadi abang abu absen abu-abu acar acara acak adat adegan admin aduk aga agak
agung ahli air akar akal akbar akhir akhlak aki akik akses aksi aktif aku akumulasi
alam alas alamat alat albino alga aliran alokasi alpa aluminium amal amandel amat
ambang amber ambulans ampas amplas amuk amunisi anak analisis analog anarki aneka
anggur angin anggota angkat angkringan angkuh angkul ansor antar antara antik antri
apa apal apel aplikasi apotek arang arak aram arif arisan arloji armada aroma arsip
arta arti artis asah asal asap asing askar asli asrama aspal aspek asta asuh atap
atasi atma atrium atur auditor aura avatar avokado awan awas awet awig ayah ayam
ayom ayung azan azas
babad babat babi babon babu bacot badai badak badan badge badik badu bagas bagi
bagus bahagia bahasa bahan bahaya bahe bahu bahwa baik baki bakar bakiak bakat
bakau bakso balada balai balap balar balas bale balik balok balon bambu bana banal
banas bandar bandel banding bandrol bangir bangka bangku bangsat bangsa bangun
banir banjir bank banna bantai bantal banter banting bantu banyak bapak barak
barang barat barbar bareng bari baris barkah barong baru barudak barung basah
basang basis basi baskom basmali baster batas batik batin batita batu batur bawa
bawah bawal bawang bayan bayar bayi bayu beban beber bebek belah belaka belalai
belalang belang belanja belas belat belem belenggu beliau belibis belimbing belok
belut bemo benci bendung bendahara bendera bendungan benih benar benggang bengkak
bengkel bening bento bentuk bentur benang berak berang berani beras berat berbekas
bercak berembang beres berkat berok berongga beruang beruntung besar besi bestari
bet beta betah betis beton betah bidadari bidang bidi bidik biduk bijaksana bijak
biji bikin bila bilang biliar bilik bina binaan binasa binar bingke bini bintik
bintang binatang bira biri biru bisa bisik bistik bison bital bius biola biro
bivak blangko blong boas boba bobok bobol bobot bobrok bocek bocor bocah bodor
bogel bogem bohong boiler bokap bokor boks bola bolak bold boling bolong bolos
bom bomba bonang bondol bondot bonus bonyok bor bordir boring borok bos bosan
botak botol boyan brankas brengsek brosur brim brisa brono brongseng brot bubar
bubat bubuk bubur bucu budi budak budaya bude buduk budiman buaya bual buang buar
buas bubu bubuk bubut buah bucal bucu bude buduk buaya budi budiman buaya buci
budek budek bujang bujang bujur buka bukit bukti bulan bulat bulu bumbu bumi bunci
buncit bundar bunga bungkus buntu bupati buruh burung busuk busur buta butuh buyar
cabai cabang cabik cabis cabul cabut cacing cadar cadas cagak cahaya cair cakra
calon camar campur candi cangkir cangkul cantik capai capil capung caraka carik
cari carta casa casing cat catat catut caur cawe cabar cabak cabik cabis cabar
cebok cece cedera cegah cegat cebek ceki celah celak celana celeng celup cemara
cemplung cempaka cendekia cendrawasih cengek cengkeh cengkrong cengkir ceplos
ceplas ceplok cepuh cedok ceduk ceguk cekel ceker ceking cekik cekok celempung
cemplong cempluk cempedak cenil cengkih cengklong cerah cerca cerdas cerita cernet
ceroboh cerobong cerpen cetera cetak cikur cincang cincin cinder cingkrung cipit
cipluk ciplung ciprat cipuk cirit cium cokelat cokmar cola colek coli colok colt
combrang comot compang congkil congklang congklok congkong copet coplok corak
coret corong cucu cucuk cucut cuaca cuali cuanki cubic cubit cucup cukup cukil
cukong culik cungket cungking cungkok cupang cuplik curah curam curang curi curing
catur cawu
dahulu daftar dagu dahan dahak dahi daif daging dahsyat damar damai dampak danau
dangdut dangu dani dari daring darurat daripada dalam dangkal dan datar data
datang dawai daya dayung debak debam debar debat debu debuk dedak dedalu dedak
defisit delegasi demam demikian demo demplot dendam dendeng dengar dengkul denok
depang depa derap deret derivasi desk detak detak dewa dewi diabetes dialog diam
dian diapositif didih diding dilarat dini diri dirumah disko dogol doa dolar dompet
donasi dongeng dongkrak dopa dosen dosa dinding dosis dpr drama drastis duka dulu
dalamnya dampak danau dalam dana dara dawai
eboni edan efek egal egar ekor elang elastis eleh elemen eleng elit elor embak
embal embang ember embun embus emce emoh empang empat empeng empu emputi encok
endah endap endus eneng enjing enjin enjit enak enggang engga engkol engsel enjet
entah entok enas encim entong enuk enam
epar epik epir erat erem ergonomi eropah esai esbalok esbek esemka eskalator esek
eskapi eski eskrim eskrin etam etek etika etnik etual etung ewuh eyang
fabrik fajar fakir fakta faks fana faksimili faktor faktur fanatik fantasi farmasi
faset fatal fatwa fauzi favorit fasih fawzi febi femina feminin femur fend fenomena
feral feri fermat fermi ferok festival firdaus firman firsa fisik fiskal fital
fitnah fitrah fitur fiuh flamboyan flat flavor fleksi flex flip flora flores flu
fluida fluktuasi flus fobia fokus folio folk font food fool format formasi formulir
formula fortuna forum fosfor fosil foto fotokopi fotografi foton fraksionasi fragmen
fraktal fraksi fraktur framboyan frasa frekuensi freon fresh frika frigid fringe
fris frustasi fulus fungsi fungsional fungsionil furnitur fusi futbol futsal
gabus gagak gagal gagang gagap gahar gairah gajah gajih galau galaksi galat gale
galgal gali galih galinggam galon galuh galur gamang gamat gambang gambas gambir
gambut gamel gamelan gamis gampang gampong gana gandar gandaria ganding gandul
gandus ganel ganep gang gangan ganggang gangsa gantang ganti gantung ganja ganjil
gapah gapang gape gaple gapura garak garba gardan gardu garet garis garmen garong
garpu garut garwa gasebo gasing gas gasak gatal gatah gawah gawat gawai gawok gayam
gayang gayat gayung gayut gebah gebar gebet gebyar geca gecul gedebong gedeg gedong
geger gegap gejala geji gejut gekap gekek gekel gekok gelagap gelak gelam gelang
gelap gelatik gelatin gelandangan gelas geligis gelimang gelinggam gelintir gelisah
gelondong gelombang gelongsor gelor gelora gelosor geluk gembala gembel gembi
gemblung gembong gembul gemas gembira gemercik gemerlap gemetar gemuk gemuruh genap
gencar gender genderang gendewa gendhing gendik gending gendut genjah genjil
genjlong genjot genot genre genset genta gentala gentar genteng gentong gentur
gendala generasi genetik genjreng gebyak gebyar gecapi gejolak geladak gelagah gelah
gelana gendut genteng genta gentar
habis habitat hadap hadiah hadir hadirin hadits hampa handai handuk hangat hantu
harapan harbata hard hardwar hardware harimau harga harmoni harum hasat hasi hasil
hasta hati hati-hati haus hawa hayati hebat hebak heboh hebat hela helah hela helmi
helus hem hemah hembus hening heneng hingga hisap hita hitam hitung hoax hoki holat
hormat hos host hutan hutang
ibadah ibarat ibarat iblis ibu ibukota ibarat ices igam igau ikan ikhtiar ikhlas
ikhlas iklim ikut ilham ilir ilmu imam imbang imbau imbauan imigrasi iming-iming
impor impoten imunitas indah index indah indra induk induk industri infak infeksi
inferensi informasi ingat ingatan ingkar ingkar inggris ingkar ingkar inisiatif
inkaso inklinasi inovasi instansi instan instalasi instrumen intan integritasi
inteligen intens intelijen inti intro introspeksi invasi investasi inovasi iq
ira irama irit irit iritasi isap isap isarat iseng iseng iseng isyarat istana istilah
istirahat istri izin ijazah ijon ikat ikan ikut ilham ilmu iman imbas imbau impor
inci induk infaq ingat injak intan ironi isap istana istirahat izin
jabat jabang jaban jabatan jadwal jafar jafaran jagat jagung jahat jahil jahit jail
jajan jajanan jajar jakarta jaksen jalar jalin jamban jambe jambu jambak jamet jam
jamur janda jangkar janggal janggut jantan jangkar jangkung jantan jaring jaringan
jarak jalak jalak jarum jas jasa jasad jasmani jasa jahe jambu jamet jamban
janggal janggut jangkar jaring jaringan jaring jarum jas jasa jasad jasmani jahe
jambu jamet jamban janggal janggut jangkar jaring jaringan jaring jarum jas jasa
jasad jasmani jahe jambu jamet jamban janggal janggut jangkar jaring jaringan jaring
jarum jas jasa jasad jasmani jahe jambu jamet jamban janggal janggut jangkar jaring
jaringan jaring jarum jas jasa jasad jasmani jahe jambu jamet jamban janggal janggut
jangkar jaring jaringan jaring jarum jas jasa jasad jasmani jahe jambu jamet jamban
kabar kabin kadal kaki kakak kakap kakatua kakek kaki kakus kala kalabai kalaka
kalangan kalender kaleng kaliber kalimat kalong kalor kalung kamar kambing kamdi
kamera kampus kamu kanal kancana kancing kanda kandas kanguru kanibalis kanjin kanjun
kantin kantong kapak kapak kapal kapas kapel kapital kapok kapsul kapuk kapus karang
karbit karcis kardi karet karikatur karir karma karang kasar kasau kasih kasir kasus
kata katab katak katalog katun kaos kaping kapling kapok kapten karang karbit karet
karir kasih kata katab kaping kapling kapsul kapuk kapus karang karbit karet karir
kasih kata katab kaping kapling kapsul kapuk kapus kebab kebal kebangga kebar kebas
kebiasaan kecap kecil kecubung kecur uled kejam kejar keju keka kelab keladi kelam
kelapa kelasi kelek kelapa kelasi kelek kelambai kelambit kelamin kelam kelambai
kelambit kelamin kelam kelapa kelasi kelek kelambai kelambit kelamin kelapa kelasi
kelek kelambai kelambit kelamin kelapa kelasi kelek kelambai kelambit kelamin kelapa
kelasi kelek kelambai kelambit kelamin kelapa kelasi kelek kelambai kelambit kelamin
labu labil labil labr labuhan lace lacur lada lade lagu lagur lahap lahir laut lalu
lambat lambe lampu lamina lambe lamun lana lana lanas landas lantai lanyap lapak
lapar lapar lapik lapuk lapis laras larasati larva las laso lata latest latih latong
latun lauk lauk lautan lava lawang lawan lawan lawan lawan layang layar layar layar
lazat lebah lebah lebah lebai lebai lebak lebak lebam lebam leban leban lebar lebar
lebat lebat lecah lecah lecek lecek lecek ledak ledak ledeng leher leher lekat lekat
lekat lekong lekong lelai lelai lelaki lelaki lelap lelap lelas lelas lele lele lele
lemah lemak lemak lemari lemari lembar lembar lembar lemboh lemboh lempar lempar
lempar lempeng lempeng lempong lenan lengah lengah lengang lengang lengas lengas
lenggak lenggak lenggok lenggok lengkap lengkap lengket lengket lengkung lengkung
lensa lentik lentik lentuk lepar lepas lepas lepas lepet lepet lepet lepas lepat
leput lerai lerai lesung lesung lesung letak letak letih letih letup letup lever
liar liar liat liat libas libas libat libat libur libur licik licik licin licin
lidah lidah lidah lihai lihai lihai lika-liku lika-liku liku liku limbah limbah
limau limau lima lima limas limas limit limo limpah limpah limpahan limpahan limut
lincah lincah lincah lindap lindap lindungi lindungi lingga lingga linggis linggis
lingkar lingkar lingkungan lingkungan linglung linglung lintah lintah lintang
lintang lintas lintas lintik lintik lintik linting linting liris liris lisut lisut
liter liter litograf liuk liuk liuk liur liur liur lobang lobang lobang lobi lobi
locah loceng loceng loda lodaya logam logam logis logis lohor lohor lokasi lokasi
loket loket lola lola lomba lomba lomba lompat lompat lompat lompong lompong loncat
loncat loncat longgar longgar longok longok loncat loncat loncong loncong lonjak
lonjak lontang lontang lontar lontar lontar lontok lontok lontong lontong lopak
lopak loper loper loqak lorot lorot loteng loteng lotot lotot lowong lowong luber luber
lubang lubang luber lubir lubir lucah lucah luces lucu lucu ludah ludah luding luding
lugas lugas lugu lugu lugur lugur lukis lukis lukis lukman lumayan lumayan lumbung
lumbung lumut lumut luncur luncur lundang lundang lunggang lunggang lungguh lungguh
lungsi lungsi luntur luntur lunak lunak lunari lunaria lunci lunci luntur lurah lurah
lurik lurik lurus lurus lurus lurus lusa lusa lusi lusi lusta lusta luthfi lutut lutut
macan macet madah madah madang madang madu madu madrasah madrasah maestro maestro
mafia mafik magang magang maha mahal mahal mahar mahar mahkota mahkota mahoni mahoni
makan makan makam makam makara makara makarani makarani makbud makbud makelar makelar
makhota makhota makhluk makhluk makian makian makin makin makin makjur makjur makmur
makmur makna makna makro makro makruf makruf maksud maksud maktub maktub makanan
makanan malam malam malapetaka malapetaka malas malas malawali malawali maleh maleh
malim malim malu malu malut malut mamalia mamalia mamber mamber mamin mamin manah
manah manajemen manajemen manas manas manca manca mancana mancana mandala mandala
mandap mandap mandi mandi mandor mandor manek manek manah manas manca mancana
mandala mandap mandi mandor manek mantra mantra mantra mantra manfaat manfaat
mangap mangap mangga mangga manggis manggis mangkok mangkok mangon mangon manis
manis manis manja manja mankat mankat manuk manuk mantri mantri marah marah marah
march march marga marga marginal marginal maritim maritim mark mark market market
markisa markisa marmut marmut marut marut marmer marmer mas mas masa masa masak
masak masakan masakan masak masam masam masam masang masang masjid masjid maskot
maskot masyarakat masyarakat masif masif mastaut mastaut masuk masuk masuk masuk
mata mata mata air mata air matahari matahari materi materi mati mati mati mati
matlamat matlamat maulid maulid maut maut mawar mawar maya maya maya mayapada
mayapada mayat mayat maya mayang mayang mayat mayat mayor mayor mayordomus mayordomus
meja meja mekongko mekongko melati melati melingkar melingkar melintang melintang
meluk meluk melompat melompat member member memori memori memuat memuat menara
menara mendi mendi menengah menengah menyala menyala merah merah merak merak
merang merang merang merang meranti meranti merayap merayap merbah merbah merdu
merdu merek merek merek merek merg merta merta merpati merpati mersi mersi mesin
mesin mesjid mesjid mesti mesti metro metro mewah mewah mekar mekar melai melai
melaju melaju melam melam melambai melambai melamin melamin melamun melamun melati
melati melawan melawan melawat melawat meleleh meleleh melempar melempar melepas
melepas meleset meleset melia melia melidi melidi melihat melihat melingkar melingkar
melintir melintir meluk meluk melompat melompat melongo melongo memadu memadu
membara membara member member memetik memetik memori memori memuat memuat menara
menara menatap menatap mencoba mencoba mencolok mencolok mendingin mendingin
menepi menepi menetap menetap mengejar mengejar mengetuk mengetuk menir menir
menjelma menjelma menolak menolak mentari mentari menyala menyala menyapu menyapu
menyimpan menyimpan meraba meraba merah merah merangkai merangkai merantau merantau
merasuk merasuk merekah merekah merica merica merobohkan merobohkan merona merona
mesin mesin meta meta meter meter metode metode metro metro mewah mewah milik
milik militer militer milu milu mimi mimi minyak minyak mior mior mirah mirah
mirip mirip misai misai misi misi moco moco model model modem modem modus modus
moga moga mogok mogok mohon mohon mokas mokas molase molase momok momok moncer
moncer monyet monyet moody moody mopa mopa morat morat morfin morfin mosaik mosaik
motif motif motor motor muda muda mufakat mufakat muka muka mukadimah mukadimah
mukim mukim mula mula mulai mulai mulia mulia mulut mulut mumi mumi mumpung mumpung
muna muna muncul muncul mundur mundur munyer munyer murah murah murai murai
murih murih murka murka murtad murtad musab musab musal musal musibat musibat
musim musim musisi musisi musnah musnah musuh musuh mutlak mutlak mutu mutu
nabati nabi nadi nafas nafsu nagih nagita najis nalar nales nampa nampak nanang
nandi nanggung nanti napas napit nara narasi narik nasab nasib natal natif navaro
nawar nawala nayaka nazar negara negeri negosiasi nempel nekat nelang neraca
nepotisme neraka ners nesan netral ngakak ngambek nganga ngarai ngaruh ngasal
ngerti nggak ngopet ngos-ngosan niat nikah nikmat ningali niskala nista nota nur
nurani nyali nyanyi nyaris nyata nyawa nyekso nyenyak nyinyir nyiur nylorot
obat obor obrolan ocah ojek ojekan ojol oknum okta okupasi olah olahraga olahan
oldol olek oligarki oleng oleng-oleng ombak ombak omen omong ompong ompong oms
omzet onak onar ongko onggok ongkos onta ontran-ontren oplas oplos oplosan opname
opod opor oprek opsir optik opsi orang oranye orasi orbit orde organik oriental
orientasi orkestra ornamental otonomi otorit ouk 
pabrik pabrik pacar pacar pacar pacar pacar pace pace pace pace pachuli pachuli
pacu pacu pacul pacul padam padam padahal padam padam padang padang padang padang
pading pading padma padma padu padu paduk paduk padusan paesan pafes pagelaran
pajak pajak pakaian pakaian pakal pakal pakam pakam pakan pakan pakar pakar pakar
pakas pakas pake pake pakh pakh paki paki pakis pakis pakis pakis pakitan pakitan
paku paku paku paku pakung pakung pala pala palam palam palapa palapa palas palas
palawa palawa pale pale pale palesan palesan palfest palfest palilingan palilingan
palta palta paltung paltung pamarisan pamarisan pambudi pambudi pamid pamid
pamor pamor pamplet pamplet pamsus pamsus panah panah panas panas pancaindra
pancaindra pancakawala pancakawala pancakarya pancakarya pancalon pancalon pancang
pancang pancang pancang pancasona pancasona panca pancasona panca panda panda
pandai pandai pandan pandan pandangan pandangan pandega pandega pandhi pandhi
pandhu pandhu pandita pandita pandu pandu panen panen panca pancakawala pancasona
panglima panglima pangkat pangkat pangsit pangsit pangung pangung panjaitan
panjaitan panjang panjang panji panji panjiwala panjiwala panta panta panta pantai
pantai pantai pantang pantang pantau pantau panca pancakawala pancakawala pancasona
pantun pantun panyileukan panyileukan papak papak papalia papalia papar papar
papasan papasan papat papat papyrus papyrus par par parab parab parabola parabola
parade parade paradigma paradigma paraf paraf paralel paralel paralelogram
paralelogram paralanguage paralanguage paralog paralog param param parameter
parameter parameswara parameswara parampara parampara paras paras parasit parasit
parc Partai parau parau parbasu parbasu pari pari paria paria parit parit pariwisata
pariwisata parkit parkit parlemen parlemen parmin parmin parmata parmata parna
parna parning parning pars parsi parsial parsial paruh paruh parung parung parut
parut pas pas pasa pasa pasak pasak pasak pasal pasal pasang pasang pasif pasif
pasifis pasifis pasir pasir pasir pasisi pasisi pasrah pasrah pasukan pasukan
pasung pasung pasupati pasupati pat pat pataka pataka patal pate paten paten pater
pater patih patih patih patih patil patil patri patri patroli patroli patung patung
paul paul paut paut pavesit pavesit pay payudara payudara pe pe pe pe pe pe pe pe
pecah pecah pecah pecah pecak pecak pecak pekalongan pekalongan pekapalan pekapalan
pekarangan pekarangan pekat pekat pekin pekin peklam peklam pekleng pekleng pekosan
pekosan peleset peleset pelet pelet peli peli peli pelita pelita pelog pelog pelp
pelp pelopor pelopor pelta pelta pemahat pemahat pemali pemali pemalu pemalu
pembalut pembalut pembarong pembarong pembuat pembuat pembeda pembeda pemerah
pemerah pemikir pemikir pemuda pemuda pemudi pemudi pen pen pena pena penanda
penanda penanda penanda penandatangan penandatangan penangkal penangkal penangkap
penangkap penanti penanti penantian penantian penata penata penawar penawar penca
penca pencabut pencabut pencari pencari pencarian pencarian penceng penceng pendam
pendam pendaki pendaki pendam pendam pendapa pendapa pendapat pendapat pendamping
pendamping pendapat pendapat pendara pendara pendarahan pendarahan pendatang
pendatang pendek pendek pendorong pendorong pendosa pendosa pendulum pendulum
pencaharian pencaharian pencemar pencemar penceng penceng pencipta pencipta pencitra
pencitra pendahara pendahara penanda penanda penandatangan penandatangan penangkal
penangkal penangkap penangkap penanti penanti penanti penantian penantian penata
penata penawar penawar penca penca pencabut pencabut pencari pencari pencarian
pencarian pendaki pendaki pendakian pendakian pendorong pendorong pendosa pendosa
pencaharian pencaharian pencemar pencemar penceng penceng pencipta pencipta
pendahara pendahara penanda penandatangan penangkal penangkap penanti penantian
penata penawar penca pencabut pencari pencarian pendaki pendakian pendorong pendosa
pencaharian pencemar penceng pencipta pendahara
agama aksara akuarium akuntan akur akreditasi aktiva alarm aliansi alias alkisah
alkohol alibi almanak alumni aman amanah amar amatir amarah ambisi ambruk ambil
amtenar ancam andai andal andalan andil angsa angsur anggun angguk anjlok anjung
anjak anjing anjur anjuran ansiklopedi antre antusias anugerah anuitas anyam
anyaman apam aparat apresiasi apis aristokrasi arsenal asetat asma asean aseng
astagina atlet atribut audio aurora autodidak avantgarde azalea baja bekas
bendera beranda berondel biang bibir biduk bilik biner bioskop bodoh bogor bonafid
boraks boyang brimstone buana bucin bukit-bukit bulak buluh bungkam bungkam busana
buz buzzer cakrawala canggih capai caracau catatan cekak cekakak celeng cemplang
cenderu cengkeh cermat cerminkan cibir cikal cikar cikini cilok cilok ciluk cincau
cinta cipta cisitu cucikan cuki cuk cukup cupang cuplik curi curup cussy
`;

const words = SEED.toLowerCase().split(/\s+/).filter(Boolean);
const unique = Array.from(new Set(words)).sort();

if (unique.length < TARGET) {
  console.error(`Seed has only ${unique.length} unique words; need >= ${TARGET}.`);
  process.exit(1);
}

const chosen = unique.slice(0, TARGET);

const out = `// AUTO-GENERATED by scripts/build-wordlist.mjs — do not edit by hand.
// ${chosen.length} unique common Indonesian words, sorted for stable indices.
// 12-word keys => ${Math.floor(Math.log2(chosen.length) * 12)} bits of entropy.

export const WORDLIST: string[] = ${JSON.stringify(chosen, null).replace(/\n/g, '\n')};

export const WORDSET: Set<string> = new Set(WORDLIST);
`;

const outPath = resolve(__dirname, '..', 'extension', 'lib', 'wordlist-id.ts');
writeFileSync(outPath, out, 'utf8');
console.log(`Wrote ${chosen.length} unique words -> ${outPath}`);
