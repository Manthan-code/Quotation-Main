import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft, Pencil, Eye, X,Printer } from "lucide-react";
import { useNavigate, useParams  } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import _ from "lodash";
const FONT = { fontFamily: "Times New Roman, serif" };
const cellCls = "border px-1 text-center text-xs whitespace-nowrap";

const blankRow = {
  series: "",
  typology: "",
  insideInterlock: "",
  outsideInterlock: "",
  meshInterlock:"",
  rail: "",
  finish: "",
  glass: "",
  lock: "",
  widthMM: "",
  heightMM: "",
  qty: 1,
  sqft: "",
  sqm: "",
  rateSqFt: "",
  rateSqM: "",
  rateType: "sqft",
  amount: "",
};

const Field = ({ name, value, onChange, readOnly = false, type = "text", options = [], labelKey }) => {
  const label = name
    .split(/(?=[A-Z])/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col gap-1 text-sm" style={FONT}>
      <label className="font-medium">{label}</label>
      {readOnly ? (
        <div className="border rounded px-3 py-2 bg-gray-50">{value || "-"}</div>
      ) : options.length ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-xs"
          required={name !== "finish"} // Finish is optional
        >
          <option value="">--</option>
          {options.map((o) => (
            <option key={o._id || o.id} value={o._id || o.id}>
              {o[labelKey] || o.name || o.title || o.code || o.series || o.model || "Unknown"}
            </option>
          ))}
        </select>
      ) : (
        <input
          required
          type={type}
          name={name}
          value={value}
          placeholder={label}
          onChange={onChange}
          className="border rounded px-3 py-2 text-xs"
        />
      )}
    </div>
  );
};

const RowModal = ({ mode, form, setForm, onSave, onClose, lists }) => {
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === "series") updated.typology = "";
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-7xl w-full">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold" style={FONT}>
            {mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View"} Row
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {mode === "view" ? (
          <div className="grid grid-cols-3 gap-4">
            <Field
              name="series"
              value={lists.series.find((s) => s._id === form.series)?.series || "-"}
              readOnly
            />
            <Field
              name="typology"
              value={lists.typologiesBySeries[form.series]?.find((t) => t._id === form.typology)?.title || "-"}
              readOnly
            />
            <Field name="widthMM" value={form.widthMM} readOnly type="number" />
            <Field name="heightMM" value={form.heightMM} readOnly type="number" />
            <Field
              name="insideInterlock"
              value={lists.interlocks.find((i) => i._id === form.insideInterlock)?.model || "-"}
              readOnly
            />
            
            <Field
              name="meshInterlock"
              value={lists.interlocks.find((i) => i._id === form.meshInterlock)?.model || "-"}
              readOnly
            />
            <Field
              name="outsideInterlock"
              value={lists.interlocks.find((i) => i._id === form.outsideInterlock)?.model || "-"}
              readOnly
            />
            <Field
              name="rail"
              value={lists.rails.find((r) => r._id === form.rail)?.model || "-"}
              readOnly
            />
            <Field
              name="finish"
              value={lists.finishes.find((f) => f._id === form.finish)?.title || "-"}
              readOnly
            />
            <Field
              name="glass"
              value={lists.glasses.find((g) => g._id === form.glass)?.title || "-"}
              readOnly
            />
            <Field
              name="lock"
              value={lists.locks.find((l) => l._id === form.lock)?.title || "-"}
              readOnly
            />
            <Field name="qty" value={form.qty} readOnly type="number" />
            <Field name="sqft" value={form.sqft} readOnly />
            <Field name="sqm" value={form.sqm} readOnly />
            <Field name="amount" value={form.amount} readOnly />
          </div>
        ) : (
          <form onSubmit={onSave} className="grid grid-cols-3 gap-4">
            <Field
              name="series"
              value={form.series}
              onChange={handle}
              options={lists.series}
              labelKey="series"
            />
            <Field
              name="typology"
              value={form.typology}
              onChange={handle}
              options={lists.typologiesBySeries[form.series] || []}
              labelKey="title"
            />
            <Field name="widthMM" value={form.widthMM} onChange={handle} type="number" />
            <Field name="heightMM" value={form.heightMM} onChange={handle} type="number" />
            <Field
              name="insideInterlock"
              value={form.insideInterlock}
              onChange={handle}
              options={lists.interlocks}
              labelKey="model"
            />
            {form.typology?.toLowerCase().includes("m") && (
              <Field
                name="meshInterlock"
                value={form.meshInterlock}
                onChange={handle}
                options={lists.interlocks}
                labelKey="model"
              />
            )}
            <Field
              name="outsideInterlock"
              value={form.outsideInterlock}
              onChange={handle}
              options={lists.interlocks}
              labelKey="model"
            />
            <Field
              name="rail"
              value={form.rail}
              onChange={handle}
              options={lists.rails}
              labelKey="model"
            />
            <Field
              name="finish"
              value={form.finish}
              onChange={handle}
              options={lists.finishes}
              labelKey="title"
            />
            <Field
              name="glass"
              value={form.glass}
              onChange={handle}
              options={lists.glasses}
              labelKey="title"
            />
            <Field
              name="lock"
              value={form.lock}
              onChange={handle}
              options={lists.locks}
              labelKey="title"
            />
            <Field name="qty" value={form.qty} onChange={handle} type="number" />
            <div className="col-span-3 flex justify-end gap-3 pt-2">
              <button
                className="flex items-center gap-1 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm"
                style={FONT}
              >
                {mode === "add" ? "Add Row" : "Update Row"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 bg-[#EE4B2B] text-white px-4 py-2 rounded text-sm"
                style={FONT}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function QuotationEditor({ mode = "add" }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
const projectId = searchParams.get("project");

  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState({
    series: [],
    typologiesBySeries: {},
    finishes: [],
    glasses: [],
    locks: [],
    allProducts: [],
    interlocks: [],
    rails: [],
    frames: [],
    sashes: [],
    middle:[],
    hardwares: [],
  });
  const [header, setHeader] = useState({
    clientName: "",
    clientCity: "",
    location: "gujarat",
    cgst: 9,
    sgst: 9,
    igst: 18,
    fabrication: 0,
    installation: 0,
    projectId : "",
  });
  const [modal, setModal] = useState({ type: null, index: null });
  const [form, setForm] = useState(blankRow);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotationId, setQuotationId] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [originalData, setOriginalData] = useState(null);



  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          { data: grouped = {} },
          { data: glasses = [] },
          { data: locks = [] },
          { data: finishes = [] },
          { data: aluminium = [] },
          {data: hardwares = [] },
        ] = await Promise.all([
          api.get("/products/grouped").catch((err) => {
            console.error("Failed to fetch /products/grouped:", err.message);
            return { data: { series: [], typologiesBySeries: {}, allProducts: [] } };
          }),
          api.get("/glass").catch((err) => {
            console.error("Failed to fetch /glass:", err.message);
            return { data: [] };
          }),
          api.get("/locks").catch((err) => {
            console.error("Failed to fetch /locks:", err.message);
            return { data: [] };
          }),
          api.get("/finish").catch((err) => {
            console.error("Failed to fetch /finish:", err.message);
            return { data: [] };
          }),
          api.get("/aluminium").catch((err) => {
            console.error("Failed to fetch /aluminium:", err.message);
            return { data: [] };
          }),
          api.get("/hardware").catch((err) => {
          console.error("Failed to fetch /hardware:", err.message);
          return { data: [] };
        }),
        ]);

        
       if (mode === "edit" && id) {
  const { data } = await api.get(`/quotationEditor/${id}`);
  setHeader(data.header || {});
  setRows(data.rows || []);
  setQuotationId(data._id);
  setOriginalData(data); // ✅ Store for later comparison
  console.log("Original data loaded:", data);
}


        const interlocks = aluminium.filter((a) => (a.model || "").toUpperCase().includes("INTERLOCK"));
        const rails = aluminium.filter((a) => (a.model || "").toUpperCase().includes("RAIL"));
        const frames = aluminium.filter((a) => (a.model || "").toUpperCase().includes("TRACK"));
        const sashes = aluminium.filter((a) => (a.model || "").toUpperCase().includes("HANDLE"));
        const middle = aluminium.filter((a) =>
  (a.model || "").toUpperCase().includes("CENTRALMIDDEL")
);
console.log("💡 Aluminium fetched:", aluminium.map(a => a.model));
console.log("🔍 Filtered middle:", middle.map(m => m.model));

        const series = Array.isArray(grouped.series) ? grouped.series : [];
        const finishesList = Array.isArray(finishes) ? finishes : [];

        setLists({
          series,
          typologiesBySeries: grouped.typologiesBySeries || {},
          interlocks,
          rails,
          frames,
          sashes,
          middle,
          finishes: finishesList,
          glasses,
          locks,
          allProducts: grouped.allProducts || [],
          hardwares,
        });

       if (mode === "add" && projectId) {
  setHeader((prev) => ({ ...prev, projectId }));
}

if (mode === "view" && !projectId && header.projectId) {
  // fallback: projectId was loaded from quotation header
  const projectIdToUse = header.projectId;

  const { data } = await api.get(`/quotationEditor/project/${projectIdToUse}`);
  const sorted = data.sort((a, b) => (a.header.revision ?? 0) - (b.header.revision ?? 0));
  setRevisions(sorted);
}

        
      
      } catch (err) {
        console.error("Data fetching failed:", err.message);
        setError("Failed to load data. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, mode])
  useEffect(() => {
  if (mode === "edit" && id) {
    (async () => {
      try {
        
        const { data } = await api.get(`/quotationEditor/${id}`);
        setHeader(data.header || {});
        setRows(data.rows || []);
      } catch (err) {
        console.error("❌ Failed to load quotation:", err.message);
        setError("Could not load quotation for editing.");
      }
    })();
  }
}, [mode, id]);

  useEffect(() => {
  if (mode !== "view") return;

  const load = async () => {
    try {
      setLoading(true);
      let projectIdToUse = projectId;

      // Step 1: If no projectId in URL, fetch it from the quotation
      if (!projectIdToUse && id) {
        const { data } = await api.get(`/quotationEditor/${id}`);
        projectIdToUse = data?.header?.projectId;
      }

      if (!projectIdToUse) {
        setError("Missing project ID");
        return;
      }

      // Step 2: Fetch all revisions for this project
      const { data: all } = await api.get(`/quotationEditor/project/${projectIdToUse}`);
      const sorted = all.sort((a, b) => (a.header.revision ?? 0) - (b.header.revision ?? 0));
      setRevisions(sorted);

      // Step 3: Pick current revision based on ID
      const current = sorted.find((q) => q._id?.toString() === id?.toString())
  || sorted[sorted.length - 1];

if (current) {
  setHeader(current.header || {});
  setRows(current.rows || []);
  setQuotationId(current._id);
}


    } catch (err) {
      console.error("Failed to load view quotation:", err);
      setError("Could not load quotation data.");
    } finally {
      setLoading(false);
    }
  };

  load();
}, [id, projectId, mode]);

  const getRate = (list, id) => {
    const item = list?.find((i) =>
      i._id === id || i.typology === id || i.series === id || i.title === id || i.code === id
    );
    return item?.rate || 0;
  };

  const handleRow = (row) => {
    const up = { ...row };
    const widthMM = +parseFloat(up.widthMM) || 0;
    const heightMM = +parseFloat(up.heightMM) || 0;
    const qty = +parseFloat(up.qty) || 1;
    const widthM = widthMM / 1000;
    const heightM = heightMM / 1000;

    const areaSqm = (widthMM * heightMM) / 1000000;
    const areaSqft = areaSqm * 10.7639;

    up.sqm = areaSqm.toFixed(3);
    up.sqft = areaSqft.toFixed(3);

    const seriesItem=lists.allProducts.find((s)=>s.series==up.series);
    const typologyItem = lists.allProducts.find((p) => p.typology === up.typology);
    const finishItem = lists.finishes.find((f) => f._id === up.finish);
    const lockItem = lists.locks.find((l) => l._id === up.lock);
    const lockRate = parseFloat(lockItem?.rate) || 0;
    const glassItem = lists.glasses.find((g) => g._id === up.glass);
    const glassRate = parseFloat(glassItem?.rate) || 0;
    const perimeterM = (widthM * 2) + (heightM * 2);
    let insideInterlockAmount = 0;
    let meshInterlockAmount = 0;
    let outsideInterlockAmount = 0;
    let railAmount =0;
    const glassAmount = areaSqm * glassRate;
    let finishAmount = 0;
    let lockAmount = 0;
    let typologyAmount = 0;
    
    let fixedCharge = 0;
    let hardwareAmount = 0;
  if(seriesItem && seriesItem.series=="3200 SP"){
    const hardwareVendorCodes = {
      roller: "PH412",
      nonroller:"PH609/U",
      skrew19X8: "CSK PH 8X19 [SS-304]",
      cleatForFrame: "CCC1022",
      cleatForShutter: "CCC1022",
      shutterAngle: "ACC_90ANGLE",
      ssPatti: "ARYAN ENTR.",
      shutterAntiLift: "PH343/B",
      skrew19X7: "CSK PH 7X19 [SS-304]",
      interLockCover: "3504",
      skrew13X7:"CSK PH 7X13 GI",
      brush:"ACC_BRUSH",
      distancePieces:"PH139/B",
      silicon:"WACKER GN CL 270	",
      woolpipe:"4.8X6 GREY WP",
      trackEPDM:"EPDM 4746",
      interlockEPDM:"EPDM 8085",
      glassEPDM:"OSAKA",
      reciever:"ORBITA",
      skrew8X25:"CSK PH 8X25 [SS-304]",
      interLockEndCap101:"PH308/B",
      interLockEndCap81:"PH260/B",
      waterDrainageCover:"PDC101/B",
      wallSkrew:"CSK PH 8X75 [SS-304]",
      rowelPlug:"32MM WP",
      pushButton:"10MM PB",
      packing:"PC_2X_3X",
      glassPacker:"MANGALUM",
      pta25x8:"GBOX-27MM",
    };

    up.hardwareDetails = {};
    
    Object.entries(hardwareVendorCodes).forEach(([key, code]) => {
      const item = lists.hardwares.find(h => h.vendorCode === code);
      if (item) {
        up.hardwareDetails[key] = {
          vendorCode: code,
          rate: parseFloat(item.rate) || 0,
        };
      }
    });
      
        const rollerRate=(up.hardwareDetails.roller?.rate || 0);
        const nonrollerRate=(up.hardwareDetails.nonroller?.rate || 0);
        const skrew19X8Rate=(up.hardwareDetails.skrew19X8?.rate || 0);
        const cleatForFrameRate=(up.hardwareDetails.cleatForFrame?.rate || 0);
        const cleatForShutterRate=(up.hardwareDetails.cleatForShutter?.rate || 0);
        const shutterAngleRate=(up.hardwareDetails.shutterAngle?.rate || 0);
        const ssPattiRate=(up.hardwareDetails.ssPatti?.rate || 0);
        const shutterAntiLiftRate=(up.hardwareDetails.shutterAntiLift?.rate || 0);
        const skrew19X7Rate=(up.hardwareDetails.skrew19X7?.rate || 0);
        const interLockCoverRate=(up.hardwareDetails.interLockCover?.rate || 0);
        const skrew13X7Rate=(up.hardwareDetails.skrew13X7?.rate || 0);
        const brushRate=(up.hardwareDetails.brush?.rate || 0);
        const distancePiecesRate=(up.hardwareDetails.distancePieces?.rate || 0);
        const siliconRate=(up.hardwareDetails.silicon?.rate || 0);
        const woolpipeRate=(up.hardwareDetails.woolpipe?.rate || 0);
        const trackEPDMRate=(up.hardwareDetails.trackEPDM?.rate || 0);
        const interlockEPDMRate=(up.hardwareDetails.interlockEPDM?.rate || 0);
        const glassEPDMRate=(up.hardwareDetails.glassEPDM?.rate || 0);
        const recieverRate=(up.hardwareDetails.reciever?.rate || 0);
        const skrew8X25Rate=(up.hardwareDetails.skrew8X25?.rate || 0);
        const interLockEndCap101Rate=(up.hardwareDetails.interLockEndCap101?.rate || 0);
        const interLockEndCap81Rate=(up.hardwareDetails.interLockEndCap81?.rate || 0);
        const waterDrainageCoverRate=(up.hardwareDetails.waterDrainageCover?.rate || 0);
        const wallSkrewRate=(up.hardwareDetails.wallSkrew?.rate || 0);
        const rowelPlugRate=(up.hardwareDetails.rowelPlug?.rate || 0);
        const pushButtonRate=(up.hardwareDetails.pushButton?.rate || 0);
        const packingRate=(up.hardwareDetails.packing?.rate || 0);
        const glassPackerRate=(up.hardwareDetails.glassPacker?.rate || 0);
        const pta25x8Rate=(up.hardwareDetails.pta25x8?.rate || 0);

    if(seriesItem && seriesItem.series === "3200 SP") {
    if (typologyItem && typologyItem.typology) {
      const typologyName = typologyItem.typology.toLowerCase();
      let frameConv = 0;
      let  sashConv=0;
      let framePara=0;
      let sashPara=0;
      let insideInterlockConv = 0;
      let insideInterlockPara = 0;
    
      let outsideInterlockConv = 0;
      let outsideInterlockPara =0 ;
      
      let meshInterlockConv = 0;
      let meshInterlockPara = 0;

      let railConv =  0;
      let railPara= 0;
        
      let middleConv = 0;
      let middlePara = 0;

      const insideInterlockItem = lists.interlocks.find((i) => i._id === up.insideInterlock);
     insideInterlockConv = insideInterlockItem ? parseFloat(insideInterlockItem.conversionUnitKgPerMtr) || 0 : 0;
     insideInterlockPara = insideInterlockItem ? parseFloat(insideInterlockItem.parameter) || 0 : 0;
    const outsideInterlockItem = lists.interlocks.find((o) => o._id === up.outsideInterlock);
     outsideInterlockConv = outsideInterlockItem ? parseFloat(outsideInterlockItem.conversionUnitKgPerMtr) || 0 : 0;
     outsideInterlockPara = outsideInterlockItem ? parseFloat(outsideInterlockItem.parameter) || 0 : 0;
     const meshInterlockItem = lists.interlocks.find((o) => o._id === up.meshInterlock);
     meshInterlockConv = meshInterlockItem ? parseFloat(meshInterlockItem.conversionUnitKgPerMtr) || 0 : 0;
     meshInterlockPara = meshInterlockItem ? parseFloat(meshInterlockItem.parameter) || 0 : 0;
    const railItem = lists.rails.find((r) => r._id === up.rail);
     railConv = railItem ? parseFloat(railItem.conversionUnitKgPerMtr) || 0 : 0;
     railPara= railItem ? parseFloat(railItem.parameter) || 0 : 0;
    const centerMiddleItem = (lists.middle || []).find((m) =>(m.model || "").toUpperCase().includes("3200 SP CENTRALMIDDEL"));
        middleConv = centerMiddleItem ? parseFloat(centerMiddleItem.conversionUnitKgPerMtr) || 0 : 0;
        middlePara = centerMiddleItem ? parseFloat(centerMiddleItem.parameter) || 0 : 0;
const sashItem = lists.sashes.find((s) => (s.model || "").toUpperCase().includes("3200 SPHANDLESGU"));
        sashConv = sashItem ? parseFloat(sashItem.conversionUnitKgPerMtr) || 0 : 0;
        sashPara = sashItem ? parseFloat(sashItem.parameter) || 0 : 0;


      // Select frame based on typology
      if (typologyName.startsWith("2t")) {
        const frameItem = lists.frames.find((f) => (f.model || "").toUpperCase().includes("3200 SP2TRACK"));
        frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
        framePara = frameItem ? parseFloat(frameItem.parameter) || 0 : 0;
       
        
      } else if (typologyName.startsWith("3t")) {
         const frameItem = lists.frames.find((f) => (f.model || "").toUpperCase().includes("3200 SP 3 TRACK"));
        frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
        framePara = frameItem ? parseFloat(frameItem.parameter) || 0 : 0;
        
       
      }

      switch (typologyName) {
        case "2t2s":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 2)) + (sashConv * widthM * 2)) * 300;
          finishAmount = (((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 2))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM)+(insideInterlockPara/1000*heightM)+(railPara/1000*widthM*2))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*4+skrew19X8Rate*10+cleatForFrameRate*4+cleatForShutterRate*4+shutterAngleRate*4+ssPattiRate*8+shutterAntiLiftRate*2+skrew19X7Rate*2+interLockCoverRate*4+skrew13X7Rate*4+brushRate*2+distancePiecesRate*16+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*4+heightM*4)+woolpipeRate*(heightM*2)+trackEPDMRate*(widthM*2+heightM*4)+interlockEPDMRate*heightM*2+glassEPDMRate*(widthM*2+heightM*4)+glassPackerRate*(widthMM*2+heightMM*4)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM * 300;
          outsideInterlockAmount = outsideInterlockConv * heightM * 300;
           railAmount = railConv * 2 * widthM * 300;
            lockAmount=lockRate*2;
          break;
        case "2t3s":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 2)) + (sashConv * widthM * 2)) * 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 2))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(railPara/1000*widthM*2))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*6+skrew19X8Rate*16+cleatForFrameRate*4+cleatForShutterRate*4+shutterAngleRate*8+ssPattiRate*8+shutterAntiLiftRate*3+skrew19X7Rate*3+interLockCoverRate*8+skrew13X7Rate*8+brushRate*4+distancePiecesRate*24+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*4+heightM*4)+woolpipeRate*(heightM*4)+trackEPDMRate*(widthM*2+heightM*4)+interlockEPDMRate*heightM*4+glassEPDMRate*(widthM*2+heightM*6)+glassPackerRate*(widthMM*2+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2 * 300;
          outsideInterlockAmount = outsideInterlockConv * heightM*2 * 300;
           railAmount = railConv * 2 * widthM * 300;
           lockAmount=lockRate*2;
          break;
        case "2t4s":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 4)) + (sashConv * widthM * 2)+(middleConv*heightM)) * 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 4))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(railPara/1000*widthM*2)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*8+skrew19X8Rate*20+cleatForFrameRate*4+cleatForShutterRate*8+shutterAngleRate*8+ssPattiRate*16+shutterAntiLiftRate*4+skrew19X7Rate*4+interLockCoverRate*8+skrew13X7Rate*8+brushRate*4+distancePiecesRate*32+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*4+heightM*8)+woolpipeRate*(heightM*4)+trackEPDMRate*(widthM*2+heightM*4)+interlockEPDMRate*heightM*4+glassEPDMRate*(widthM*2+heightM*8)+glassPackerRate*(widthMM*2+heightMM*8)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2 * 300;
          outsideInterlockAmount = outsideInterlockConv * heightM*2 * 300;
           railAmount = railConv * 2 * widthM * 300;
            lockAmount=lockRate*3;
          
          break;
          case "3t3s":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 2)) + (sashConv * widthM * 2))* 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 2))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(railPara/1000*widthM*3))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*6+skrew19X8Rate*16+cleatForFrameRate*8+cleatForShutterRate*8+shutterAngleRate*12+ssPattiRate*16+shutterAntiLiftRate*6+skrew19X7Rate*6+interLockCoverRate*12+skrew13X7Rate*24+brushRate*6+distancePiecesRate*48+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*12)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*4+glassEPDMRate*(widthM*2+heightM*6)+glassPackerRate*(widthMM*2+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2 * 300;
          outsideInterlockAmount = outsideInterlockConv * heightM*2 * 300;
           railAmount = railConv * 3 * widthM * 300;
           lockAmount=lockRate*2;
          break;
          case "3t6s":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 4)) + (sashConv * widthM * 2)+(middleConv*heightM))* 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 4))+((sashPara/1000)*(widthM * 2)) +(outsideInterlockPara/1000*heightM*4)+(insideInterlockPara/1000*heightM*4)+(railPara/1000*widthM*3)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*12+skrew19X8Rate*30+cleatForFrameRate*8+cleatForShutterRate*4+shutterAngleRate*8+ssPattiRate*8+shutterAntiLiftRate*3+skrew19X7Rate*3+interLockCoverRate*8+skrew13X7Rate*16+brushRate*4+distancePiecesRate*24+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*4+heightM*4)+woolpipeRate*(heightM*4)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*6+glassEPDMRate*(widthM*3+heightM*12)+glassPackerRate*(widthMM*3+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*4 * 300;
          outsideInterlockAmount = outsideInterlockConv * heightM*4 * 300;
           railAmount = railConv * 3 * widthM * 300;
           lockAmount=lockRate*3;
          break;
          case "3t2s1m":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 3)) + (sashConv * widthM *3))* 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 3))+((sashPara/1000)*(widthM * 3)) +(outsideInterlockPara/1000*heightM*1)+(insideInterlockPara/1000*heightM*1)+(meshInterlockPara/1000*heightM*1)+(railPara/1000*widthM*3))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*4+nonrollerRate*2+pta25x8Rate*4+skrew19X8Rate*12+cleatForFrameRate*8+cleatForShutterRate*6+shutterAngleRate*6+ssPattiRate*12+shutterAntiLiftRate*3+skrew19X7Rate*3+interLockCoverRate*6+skrew13X7Rate*12+brushRate*4+distancePiecesRate*24+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*6)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*3+glassEPDMRate*(widthM*2+heightM*6)+glassPackerRate*(widthMM*3+heightMM*4)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM* 300;
          outsideInterlockAmount = outsideInterlockConv * heightM * 300;
          meshInterlockAmount= meshInterlockConv * heightM * 300;
           railAmount = railConv * 3 * widthM * 300; 
           lockAmount=lockRate*3;
          break;
          case "3t3s2m":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 4)) + (sashConv * widthM *3)+(middleConv*heightM))* 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 4))+((sashPara/1000)*(widthM * 3)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(meshInterlockPara/1000*heightM*2)+(railPara/1000*widthM*3)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*6+nonrollerRate*4+pta25x8Rate*8+skrew19X8Rate*18+cleatForFrameRate*8+cleatForShutterRate*12+shutterAngleRate*12+ssPattiRate*24+shutterAntiLiftRate*6+skrew19X7Rate*6+interLockCoverRate*12+skrew13X7Rate*24+brushRate*6+distancePiecesRate*40+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*6)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*6+glassEPDMRate*(widthM*3+heightM*10)+glassPackerRate*(widthMM*3+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2* 300;
          outsideInterlockAmount = outsideInterlockConv * heightM *2* 300;
          meshInterlockAmount= meshInterlockConv * heightM * 2*300;
           railAmount = railConv * 3 * widthM * 300; 
           lockAmount=lockRate*4;
          break;
          case "3t4s2m":
          typologyAmount = ((frameConv * (widthM * 2 + heightM * 2)) + (sashConv * (heightM * 6)) + (sashConv * widthM *3)+(middleConv*heightM))* 300;
          finishAmount =(((framePara / 1000) * (widthM*2+heightM*2))+((sashPara/1000)*(heightM * 6))+((sashPara/1000)*(widthM * 3)) +(outsideInterlockPara/1000*heightM*2)+(insideInterlockPara/1000*heightM*2)+(meshInterlockPara/1000*heightM*2)+(railPara/1000*widthM*3)+(middlePara/1000*heightM))* (finishItem?.rate || 0);
          hardwareAmount=rollerRate*8+nonrollerRate*4+pta25x8Rate*8+skrew19X8Rate*22+cleatForFrameRate*8+cleatForShutterRate*12+shutterAngleRate*12+ssPattiRate*24+shutterAntiLiftRate*6+skrew19X7Rate*6+interLockCoverRate*12+skrew13X7Rate*24+brushRate*6+distancePiecesRate*48+(widthMM/550)*waterDrainageCoverRate+((perimeterM*1000)/650)*wallSkrewRate+rowelPlugRate*((perimeterM*1000)/650)+pushButtonRate*((perimeterM*1000)/650)+packingRate*((perimeterM*1000)/550)+woolpipeRate*(widthM*6+heightM*12)+woolpipeRate*(heightM*6)+trackEPDMRate*(widthM*3+heightM*6)+interlockEPDMRate*heightM*6+glassEPDMRate*(widthM*3+heightM*12)+glassPackerRate*(widthMM*3+heightMM*6)/650+siliconRate*(perimeterM*2/9.5);
           insideInterlockAmount = insideInterlockConv * heightM*2* 300;
          outsideInterlockAmount = outsideInterlockConv * heightM *2* 300;
          meshInterlockAmount= meshInterlockConv * heightM * 2*300;
           railAmount = railConv * 3 * widthM * 300; 
           lockAmount=lockRate*4;
          break;
        default:
          console.warn(`Warning: No matching typology found for "${typologyName}"`);
          typologyAmount = 0;
          finishAmount = 0;
          fixedCharge = 0;
          break;
      }
    }
    }else if(seriesItem && seriesItem.series === "5000") {
  }}
  
    const totalPerUnit = typologyAmount + lockAmount + railAmount + glassAmount + insideInterlockAmount + outsideInterlockAmount + finishAmount+hardwareAmount;
    const totalAmount = (totalPerUnit + fixedCharge) * qty;

    
    up.amount = totalAmount.toFixed(2);
    up.rateSqM = areaSqm > 0 ? (totalPerUnit / areaSqm).toFixed(2) : "";
    up.rateSqFt = areaSqft > 0 ? (totalPerUnit / areaSqft).toFixed(2) : "";

    console.log({
     typologyAmount,
     hardwareAmount,
     finishAmount,
     insideInterlockAmount,
     outsideInterlockAmount,
     lock: lockAmount,
     glassAmount,
   });


    return up;
  };

  const openAdd = () => {
    setForm(blankRow);
    setModal({ type: "add" });
  };

  const openEdit = (index) => {
    setForm(rows[index]);
    setModal({ type: "edit", index });
  };

  const openView = (index) => {
    setForm(rows[index]);
    setModal({ type: "view", index });
  };

  const closeModal = () => setModal({ type: null });

  const saveRow = (e) => {
    e.preventDefault();
    const updatedRow = handleRow(form);
    setRows((old) => {
      if (modal.type === "add") return [...old, updatedRow];
      return old.map((r, i) => (i === modal.index ? updatedRow : r));
    });
   
    closeModal();
  };

  const removeRow = (idx) => {
    if (!window.confirm("Delete row?")) return;
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const rowsAmt = rows.reduce((s, r) => s + (+r.amount || 0), 0);
  const fabricationPerSqm = +header.fabrication || 0;
const installationPerSqm = +header.installation || 0;

// 🧠 Sum all sqm from rows
const totalSqm = rows.reduce((sum, r) => sum + (+r.sqm || 0), 0);

const fabricationAmt = totalSqm * fabricationPerSqm;
const installationAmt = totalSqm * installationPerSqm;

 const taxable = rowsAmt + fabricationAmt + installationAmt;

  const taxAmt =
    header.location === "gujarat"
      ? taxable * ((+header.cgst + +header.sgst) / 100)
      : taxable * (+header.igst / 100);
  const grand = (taxable + taxAmt).toFixed(2);

async function saveQuotation() {
  try {
    if (!header.clientName || rows.length === 0) {
      alert("Please fill in Client Name and add at least one product row");
      return;
    }

    const payload = {
      header: {
        clientName: header.clientName,
        clientCity: header.clientCity,
        location: header.location,
        cgst: parseFloat(header.cgst) || 9,
        sgst: parseFloat(header.sgst) || 9,
        igst: parseFloat(header.igst) || 18,
        fabrication: fabricationPerSqm,
        installation: installationPerSqm,
        projectId: header.projectId,
      },
      rows: rows.map(row => ({
        ...row,
        glass: lists.glasses.find(g => g._id === row.glass)?._id || row.glass,
        finish: lists.finishes.find(f => f._id === row.finish)?._id || row.finish,
        lock: lists.locks.find(l => l._id === row.lock)?._id || row.lock,
        rail: lists.rails.find(r => r._id === row.rail)?._id || row.rail,
        insideInterlock: lists.interlocks.find(i => i._id === row.insideInterlock)?._id || row.insideInterlock,
        outsideInterlock: lists.interlocks.find(i => i._id === row.outsideInterlock)?._id || row.outsideInterlock,
        amount: parseFloat(row.amount) || 0,
        qty: parseInt(row.qty) || 1,
      })),
      totalAmt: taxable,
      taxAmt,
      grand,
      fabricationAmt,
      installationAmt,

    };

    if (mode === "add" && projectId) {
      const { data } = await api.post("/quotationEditor", payload);
      setQuotationId(data._id);
      alert("Quotation saved successfully.");
      nav(`/quotation/${data._id}`);
      return;
    }

    if (mode === "edit" && id) {
      if (originalData) {
  // Convert resolved values in originalData to raw _ids
  const resolvedRows = originalData.rows.map((row) => ({
    ...row,
    glass: lists.glasses.find(g => g.title === row.glass)?._id || row.glass,
    finish: lists.finishes.find(f => f.title === row.finish)?._id || row.finish,
    lock: lists.locks.find(l => l.title === row.lock)?._id || row.lock,
    rail: lists.rails.find(r => r.model === row.rail)?._id || row.rail,
    insideInterlock: lists.interlocks.find(i => i.model === row.insideInterlock)?._id || row.insideInterlock,
    outsideInterlock: lists.interlocks.find(i => i.model === row.outsideInterlock)?._id || row.outsideInterlock,
    amount: parseFloat(row.amount) || 0,
    qty: parseInt(row.qty) || 1,
  }));

  const omitRevision = (obj) => {
  const { revision, ...rest } = obj || {};
  return rest;
  };
  const cleanedOriginal = {
  header:omitRevision( {
    ...originalData.header,
    cgst: +originalData.header.cgst || 0,
    sgst: +originalData.header.sgst || 0,
    igst: +originalData.header.igst || 0,
    fabrication: +originalData.header.fabrication || 0,
    installation: +originalData.header.installation || 0,
    fixedCharge: +originalData.header.fixedCharge || 0,
    projectId: originalData.header.projectId,
    clientName: originalData.header.clientName,
    clientCity: originalData.header.clientCity,
    location: originalData.header.location,
  }),
  rows: originalData.rows.map(r => ({
    ...r,
    qty: +r.qty,
    amount: +r.amount,
  })),
  totalAmt: +originalData.totalAmt,
  taxAmt: +originalData.taxAmt,
  grand: +originalData.grand,
};


  const cleanedPayload = {
  header:omitRevision({
    ...payload.header,
    cgst: +payload.header.cgst || 0,
    sgst: +payload.header.sgst || 0,
    igst: +payload.header.igst || 0,
    fabrication: +payload.header.fabrication || 0,
    installation: +payload.header.installation || 0,
    fixedCharge: +payload.header.fixedCharge || 0,
    projectId: payload.header.projectId,
    clientName: payload.header.clientName,
    clientCity: payload.header.clientCity,
    location: payload.header.location,
  }),
  rows: payload.rows.map(r => ({
    ...r,
    qty: +r.qty,
    amount: +r.amount,
  })),
  totalAmt: +payload.totalAmt,
  taxAmt: +payload.taxAmt,
  grand: +payload.grand,
};


  if (_.isEqual(cleanedOriginal, cleanedPayload)) {
  console.warn("🔍 Difference detected between original and payload");

 alert("No changes detected. Quotation was not updated.");
  return;
}

  

}


      const { data } = await api.put(`/quotationEditor/${id}`, payload);
      alert(`New revision (R${data.header.revision}) saved successfully.`);
      nav(`/quotation/${data._id}/edit`);
    }
  } catch (err) {
    console.error("Save failed:", err);
    const errorMsg = err.response?.data?.message || err.message || "Could not save quotation";
    alert(`Error: ${errorMsg}`);
  }
}




  if (loading) {
    return (
      <div className="p-6 text-center" style={FONT}>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center" style={FONT}>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => setLoading(true)}
          className="mt-4 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm"
          style={FONT}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    
    <div className="p-6">
      {header.revision !== undefined && (
  <p className="text-sm text-gray-500 mb-1">Revision: <b>R{header.revision}</b></p>
)}
      <h2 className="text-3xl font-bold mb-4" style={FONT}>Quotation Editor</h2>
    {typeof mode === "string" && mode.toLowerCase() === "view" && revisions.length > 1 && (
  <div className="mb-4">
    <label className="text-sm font-medium" style={FONT}>Revision:</label>
    <select
      className="ml-2 border px-2 py-1 text-xs rounded"
      value={quotationId}
      onChange={e => nav(`/quotation/${e.target.value}`)}
    >
      {revisions.map((r) => (
        <option key={r._id} value={r._id}>
          R{r.header.revision ?? 0}
        </option>
      ))}
    </select>
  </div>
)}

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Client Name</label>
          <input
            value={header.clientName}
            onChange={(e) => setHeader((h) => ({ ...h, clientName: e.target.value }))}
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
        <div>
          <label className="font-medium" style={FONT}>Client City</label>
          <input
            value={header.clientCity}
            onChange={(e) => setHeader((h) => ({ ...h, clientCity: e.target.value }))}
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
      </div>

      {(mode === "edit" || mode ==="add")&&(
  <button
    onClick={() => setModal({ type: "add", index: null })}
    className="flex items-center gap-1 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm mb-4"
    style={FONT}
  >
    <Plus size={14} /> Add Product Row
  </button>
)}

      {rows.length ? (
        <table className="block w-full border text-xs mb-4 overflow-auto">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Sr",
                "Series",
                "Typology",
                "W(mm)",
                "H(mm)",
                "Inside-Interlock",
                "Mesh-Interlock",
                "Outside-Interlock",
                "Rail",
                "Finish",
                "Lock",
                "Glass",
                "Qty",
                "SqFt",
                "SqM",
                "Amount",
                "Rate/sqFt",
                "Rate/sqM",
                (mode === "edit" ? ["Actions"] : [])
              ].map((h) => (
                <th key={h} className={cellCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className={cellCls}>{i + 1}</td>
                  <td className={cellCls}>
                    {lists.series.find((s) => s._id === r.series)?.series || r.series || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.typologiesBySeries[r.series]?.find((t) => t._id === r.typology)?.title || r.typology || "-"}
                  </td>
                  <td className={cellCls}>{r.widthMM || "-"}</td>
                  <td className={cellCls}>{r.heightMM || "-"}</td>
                  <td className={cellCls}>
                    {lists.interlocks.find((i) => i._id === r.insideInterlock)?.model || r.insideInterlock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.interlocks.find((i) => i._id === r.meshInterlock)?.model || r.meshInterlock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.interlocks.find((i) => i._id === r.outsideInterlock)?.model || r.outsideInterlock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.rails.find((l) => l._id === r.rail)?.model || r.rail || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.finishes.find((f) => f._id === r.finish)?.title || r.finish || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.locks.find((l) => l._id === r.lock)?.title || r.lock || "-"}
                  </td>
                  <td className={cellCls}>
                    {lists.glasses.find((g) => g._id === r.glass)?.title || r.glass || "-"}
                  </td>
                  <td className={cellCls}>{r.qty}</td>
                  <td className={cellCls}>{r.sqft || "-"}</td>
                  <td className={cellCls}>{r.sqm || "-"}</td>
                  <td className={cellCls}>{r.amount || "-"}</td>
                  <td className={cellCls}>
                    {r.rateType === "sqft" ? r.rateSqFt : r.rateSqM}
                  </td>
                  <td className={cellCls}>
                    {r.rateType === "sqM" ? r.rateSqFt : r.rateSqM}
                  </td>
                  {mode === "edit" && (
                      <td className={cellCls}>
                        <button
                          onClick={() => openView(i)}
                          className="p-1 bg-blue-100 text-blue-700 mr-2"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(i)}
                          className="p-1 bg-green-100 text-green-700 mr-2"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {rows.length > 0 && (
                          <button
                            onClick={() => removeRow(i)}
                            className="p-1 bg-red-100 text-red-700"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    )}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p style={FONT}>No rows added yet.</p>
      )}

      {modal.type && (
        <RowModal
          mode={modal.type}
          form={form}
          setForm={setForm}
          onSave={saveRow}
          onClose={closeModal}
          lists={lists}
        />
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Fabrication Charges (per SqM)</label>
          <input
            type="number"
            step="0.01"
            value={header.fabrication}
            onChange={(e) =>
              setHeader((h) => ({
                ...h,
                fabrication: e.target.value === "" ? "" : parseFloat(e.target.value),
              }))
            }
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
        <div>
          <label className="font-medium" style={FONT}>Installation Charges (per SqM)</label>
          <input
            type="number"
            step="0.01"
            value={header.installation}
            onChange={(e) =>
              setHeader((h) => ({
                ...h,
                installation: e.target.value === "" ? "" : parseFloat(e.target.value),
              }))
            }
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <label className="font-medium" style={FONT}>Location</label>
          <select
            value={header.location}
            onChange={(e) => setHeader((h) => ({ ...h, location: e.target.value }))}
            className="border rounded px-3 py-2 text-xs w-full"
            style={FONT}
          >
            <option value="gujarat">Inside Gujarat (CGST + SGST)</option>
            <option value="out">Outside Gujarat (IGST)</option>
          </select>
        </div>
        {header.location === "gujarat" ? (
          <>
            <div>
              <label className="font-medium" style={FONT}>CGST %</label>
              <input
                type="number"
                value={header.cgst}
                onChange={(e) =>
                  setHeader((h) => ({
                    ...h,
                    cgst: e.target.value === "" ? "" : parseFloat(e.target.value),
                  }))
                }
                className="border rounded px-3 py-2 text-xs w-full"
                style={FONT}
              />
            </div>
            <div>
              <label className="font-medium" style={FONT}>SGST %</label>
              <input
                type="number"
                value={header.sgst}
                onChange={(e) =>
                  setHeader((h) => ({
                    ...h,
                    sgst: e.target.value === "" ? "" : parseFloat(e.target.value),
                  }))
                }
                className="border rounded px-3 py-2 text-xs w-full"
                style={FONT}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="font-medium" style={FONT}>IGST %</label>
            <input
              type="number"
              value={header.igst}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  igst: e.target.value === "" ? "" : parseFloat(e.target.value),
                }))
              }
              className="border rounded px-3 py-2 text-xs w-full"
              style={FONT}
            />
          </div>
        )}
      </div>

      <div className="mt-4 text-right" style={FONT}>
        <p>Products Amount: <b>{rowsAmt.toFixed(2)}</b></p>
        <p>Fabrication Charges: <b>{fabricationAmt.toFixed(2)}</b></p>
        <p>Installation Charges: <b>{installationAmt.toFixed(2)}</b></p>
        <p>Total Amount (Before Tax): <b>{taxable.toFixed(2)}</b></p>
        <p>Taxes: <b>{taxAmt.toFixed(2)}</b></p>
        <p className="text-xl">Grand Total: <b>{grand}</b></p>
      </div>

      <div className="flex gap-2 mb-4">
  {/* Back button always shown */}
  <button
    onClick={() => nav(`/project`)}
    className="flex items-center gap-1 bg-gray-400 text-white px-4 py-2 rounded text-sm"
    style={FONT}
  >
    <ArrowLeft size={16} /> Back
  </button>

  {/* View mode → only show Print */}
  {mode === "view" && quotationId && (
    <button
      onClick={() => nav(`/quotation/${quotationId}/print`, "_blank")}
      className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm"
      style={FONT}
    >
      <Printer size={16} /> Print
    </button>
  )}

  {/* Edit / Add mode → show Update / Save and Print separately */}
  {(mode === "edit" || mode === "add") && (
    <>
      <button
        onClick={saveQuotation}
        className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded text-sm"
        style={FONT}
      >
        <Save size={16} /> {mode === "edit" ? "Update" : "Save"}
      </button>

      {/* {id && (
        <button
          onClick={() => window.open(`/quotation/${id}/print`, "_blank")}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm"
          style={FONT}
        >
          <Printer size={16} /> Print
        </button>
      )} */}
    </>
  )}
</div>

    </div>
  );
}