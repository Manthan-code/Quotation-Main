import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft, Pencil, Eye, X, Printer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import _ from "lodash";
import { FileText } from "lucide-react";
import { diff } from "deep-object-diff";
const FONT = { fontFamily: "Times New Roman, serif" };
const cellCls = "border px-1 text-center text-xs whitespace-nowrap";

const blankRow = {
  series: "",
  typology: "",
  insideInterlock: "",
  outsideInterlock: "",
  meshInterlock: "",
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

const Field = ({
  name,
  value,
  onChange,
  readOnly = false,
  type = "text",
  options = [],
  labelKey,
}) => {
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
              value={
                lists.typologiesBySeries[form.series]?.find((t) => t._id === form.typology)
                  ?.title || "-"
              }
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
    middle: [],
    hardwares: [],
  });
  const [header, setHeader] = useState({
    location: "gujarat",
    cgst: 9,
    sgst: 9,
    igst: 18,
    alluminum: 300,
    discount: 0,
    fabrication: 0,
    installation: 0,
    projectId: "",
  });
  const [modal, setModal] = useState({ type: null, index: null });
  const [form, setForm] = useState(blankRow);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotationId, setQuotationId] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [prevRevision, setPrevRevision] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [revisionDiffs, setRevisionDiffs] = useState([]);

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
          { data: hardwares = [] },
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
          setHeader({
            ...header,
            ...data.header,
            alluminum: data.header?.alluminum ?? 300, // 👈 fallback to 300
          });
          setRows(data.rows || []);
          setQuotationId(data._id);
          setOriginalData(data); // ✅ Store for later comparison
        }

        const interlocks = aluminium.filter((a) =>
          (a.model || "").toUpperCase().includes("INTERLOCK")
        );
        const rails = aluminium.filter((a) => (a.model || "").toUpperCase().includes("RAIL"));
        const frames = aluminium.filter((a) => (a.model || "").toUpperCase().includes("TRACK"));
        const sashes = aluminium.filter((a) => (a.model || "").toUpperCase().includes("HANDLE"));
        const middle = aluminium.filter((a) =>
          (a.model || "").toUpperCase().includes("CENTRALMIDDEL")
        );

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
  }, [id, mode]);
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
        const current =
          sorted.find((q) => q._id?.toString() === id?.toString()) || sorted[sorted.length - 1];

        if (current) {
          setHeader({
            clientName: current.header?.clientName || "",
            clientCity: current.header?.clientCity || "",
            location: current.header?.location || "",
            cgst: current.header?.cgst ?? 9,
            sgst: current.header?.sgst ?? 9,
            igst: current.header?.igst ?? 18,
            fabrication: current.header?.fabrication ?? 0,
            installation: current.header?.installation ?? 0,
            alluminum: current.header?.alluminum ?? 300,
            fixedCharge: current.header?.fixedCharge ?? 0,
            discount: current.header?.discount ?? 0, // ✅ include this
            projectId: current.header?.projectId || "",
            revision: current.header?.revision ?? 0,
          });

          setRows(current.rows || []);
          setQuotationId(current._id);
          setQuotation(current);
          if (current.header?.revision > 0) {
            const prev = sorted.find((r) => r.header?.revision === current.header.revision - 1);
            setPrevRevision(prev);

            if (prev) {
              const clean = (q) => ({
                ...q,
                header: {
                  ...q.header,
                  cgst: +q.header?.cgst,
                  sgst: +q.header?.sgst,
                  igst: +q.header?.igst,
                  alluminum: +q.header?.alluminum,
                  fabrication: +q.header?.fabrication,
                  installation: +q.header?.installation,
                  discount: +q.header?.discount,
                },
                rows: (q.rows || []).map((r) => ({
                  ...r,
                  qty: +r.qty,
                  amount: +r.amount,
                  widthMM: +r.widthMM,
                  heightMM: +r.heightMM,
                })),
              });

              const differences = diff(clean(prev), clean(current));
              const flattened = [];

              if (differences.header) {
                for (const [key, val] of Object.entries(differences.header)) {
                  flattened.push({
                    path: `header.${key}`,
                    before: prev.header[key],
                    after: current.header[key],
                  });
                }
              }

              if (Array.isArray(differences.rows)) {
                differences.rows.forEach((row, i) => {
                  for (const [key, val] of Object.entries(row)) {
                    flattened.push({
                      path: `rows[${i}].${key}`,
                      before: prev.rows[i]?.[key],
                      after: current.rows[i]?.[key],
                    });
                  }
                });
              }

              setRevisionDiffs(flattened);
            }
          }
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
  useEffect(() => {
    if (mode === "view" && quotation?.header?.revision > 0 && revisions.length > 1) {
      const currentRev = quotation.header.revision;
      const previous = revisions.find((r) => r.header.revision === currentRev - 1);
      if (previous) setPrevRevision(previous);
    }
  }, [quotation, revisions, mode]);
  const getRate = (list, id) => {
    const item = list?.find(
      (i) => i._id === id || i.typology === id || i.series === id || i.title === id || i.code === id
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
    const aluminiumRate = parseFloat(header.alluminum) || 0;
    const discountRate = parseFloat(header.discount) || 0;
    const seriesItem = lists.allProducts.find((s) => s.series == up.series);
    const typologyItem = lists.allProducts.find((p) => p.typology === up.typology);
    const finishItem = lists.finishes.find((f) => f._id === up.finish);
    const lockItem = lists.locks.find((l) => l._id === up.lock);
    const lockRate = parseFloat(lockItem?.rate) || 0;
    const glassItem = lists.glasses.find((g) => g._id === up.glass);
    const glassRate = parseFloat(glassItem?.rate) || 0;
    const perimeterM = widthM * 2 + heightM * 2;
    let insideInterlockAmount = 0;
    let meshInterlockAmount = 0;
    let outsideInterlockAmount = 0;
    let railAmount = 0;
    const glassAmount = areaSqm * glassRate;
    let finishAmount = 0;
    let lockAmount = 0;
    let typologyAmount = 0;

    let fixedCharge = 0;
    let hardwareAmount = 0;
    if (seriesItem && seriesItem.series == "3200 SP") {
      const hardwareVendorCodes = {
        roller: "PH412",
        nonroller: "PH609/U",
        skrew19X8: "CSK PH 8X19 [SS-304]",
        cleatForFrame: "CCC1022",
        cleatForShutter: "CCC1022",
        shutterAngle: "ACC_90ANGLE",
        ssPatti: "ARYAN ENTR.",
        shutterAntiLift: "PH343/B",
        skrew19X7: "CSK PH 7X19 [SS-304]",
        interLockCover: "3504",
        skrew13X7: "CSK PH 7X13 GI",
        brush: "ACC_BRUSH",
        distancePieces: "PH139/B",
        silicon: "WACKER GN CL 270	",
        woolpipe: "4.8X6 GREY WP",
        trackEPDM: "EPDM 4746",
        interlockEPDM: "EPDM 8085",
        glassEPDM: "OSAKA",
        reciever: "ORBITA",
        skrew8X25: "CSK PH 8X25 [SS-304]",
        interLockEndCap101: "PH308/B",
        interLockEndCap81: "PH260/B",
        waterDrainageCover: "PDC101/B",
        wallSkrew: "CSK PH 8X75 [SS-304]",
        rowelPlug: "32MM WP",
        pushButton: "10MM PB",
        packing: "PC_2X_3X",
        glassPacker: "MANGALUM",
        pta25x8: "GBOX-27MM",
      };

      up.hardwareDetails = {};

      Object.entries(hardwareVendorCodes).forEach(([key, code]) => {
        const item = lists.hardwares.find((h) => h.vendorCode === code);
        if (item) {
          up.hardwareDetails[key] = {
            vendorCode: code,
            rate: parseFloat(item.rate) || 0,
          };
        }
      });

      const rollerRate = up.hardwareDetails.roller?.rate || 0;
      const nonrollerRate = up.hardwareDetails.nonroller?.rate || 0;
      const skrew19X8Rate = up.hardwareDetails.skrew19X8?.rate || 0;
      const cleatForFrameRate = up.hardwareDetails.cleatForFrame?.rate || 0;
      const cleatForShutterRate = up.hardwareDetails.cleatForShutter?.rate || 0;
      const shutterAngleRate = up.hardwareDetails.shutterAngle?.rate || 0;
      const ssPattiRate = up.hardwareDetails.ssPatti?.rate || 0;
      const shutterAntiLiftRate = up.hardwareDetails.shutterAntiLift?.rate || 0;
      const skrew19X7Rate = up.hardwareDetails.skrew19X7?.rate || 0;
      const interLockCoverRate = up.hardwareDetails.interLockCover?.rate || 0;
      const skrew13X7Rate = up.hardwareDetails.skrew13X7?.rate || 0;
      const brushRate = up.hardwareDetails.brush?.rate || 0;
      const distancePiecesRate = up.hardwareDetails.distancePieces?.rate || 0;
      const siliconRate = up.hardwareDetails.silicon?.rate || 0;
      const woolpipeRate = up.hardwareDetails.woolpipe?.rate || 0;
      const trackEPDMRate = up.hardwareDetails.trackEPDM?.rate || 0;
      const interlockEPDMRate = up.hardwareDetails.interlockEPDM?.rate || 0;
      const glassEPDMRate = up.hardwareDetails.glassEPDM?.rate || 0;
      const recieverRate = up.hardwareDetails.reciever?.rate || 0;
      const skrew8X25Rate = up.hardwareDetails.skrew8X25?.rate || 0;
      const interLockEndCap101Rate = up.hardwareDetails.interLockEndCap101?.rate || 0;
      const interLockEndCap81Rate = up.hardwareDetails.interLockEndCap81?.rate || 0;
      const waterDrainageCoverRate = up.hardwareDetails.waterDrainageCover?.rate || 0;
      const wallSkrewRate = up.hardwareDetails.wallSkrew?.rate || 0;
      const rowelPlugRate = up.hardwareDetails.rowelPlug?.rate || 0;
      const pushButtonRate = up.hardwareDetails.pushButton?.rate || 0;
      const packingRate = up.hardwareDetails.packing?.rate || 0;
      const glassPackerRate = up.hardwareDetails.glassPacker?.rate || 0;
      const pta25x8Rate = up.hardwareDetails.pta25x8?.rate || 0;

      if (seriesItem && seriesItem.series === "3200 SP") {
        if (typologyItem && typologyItem.typology) {
          const typologyName = typologyItem.typology.toUpperCase();
          let frameConv = 0;
          let sashConv = 0;
          let framePara = 0;
          let sashPara = 0;
          let insideInterlockConv = 0;
          let insideInterlockPara = 0;

          let outsideInterlockConv = 0;
          let outsideInterlockPara = 0;

          let meshInterlockConv = 0;
          let meshInterlockPara = 0;

          let railConv = 0;
          let railPara = 0;

          let middleConv = 0;
          let middlePara = 0;

          const insideInterlockItem = lists.interlocks.find((i) => i._id === up.insideInterlock);
          insideInterlockConv = insideInterlockItem
            ? parseFloat(insideInterlockItem.conversionUnitKgPerMtr) || 0
            : 0;
          insideInterlockPara = insideInterlockItem
            ? parseFloat(insideInterlockItem.parameter) || 0
            : 0;
            console.log("insideInterlockItem", insideInterlockPara);
          const outsideInterlockItem = lists.interlocks.find((o) => o._id === up.outsideInterlock);
          outsideInterlockConv = outsideInterlockItem
            ? parseFloat(outsideInterlockItem.conversionUnitKgPerMtr) || 0
            : 0;
          outsideInterlockPara = outsideInterlockItem
            ? parseFloat(outsideInterlockItem.parameter) || 0
            : 0;
            console.log("outsideInterlockItem", outsideInterlockPara);
          const meshInterlockItem = lists.interlocks.find((o) => o._id === up.meshInterlock);
          meshInterlockConv = meshInterlockItem
            ? parseFloat(meshInterlockItem.conversionUnitKgPerMtr) || 0
            : 0;
          meshInterlockPara = meshInterlockItem ? parseFloat(meshInterlockItem.parameter) || 0 : 0;
          const railItem = lists.rails.find((r) => r._id === up.rail);
          railConv = railItem ? parseFloat(railItem.conversionUnitKgPerMtr) || 0 : 0;
          railPara = railItem ? parseFloat(railItem.parameter) || 0 : 0;
          const centerMiddleItem = (lists.middle || []).find((m) =>
            (m.model || "").toUpperCase().includes("3200 SP CENTRAL MIDDEL")
          );
          middleConv = centerMiddleItem
            ? parseFloat(centerMiddleItem.conversionUnitKgPerMtr) || 0
            : 0;
          middlePara = centerMiddleItem ? parseFloat(centerMiddleItem.parameter) || 0 : 0;
          const sashItem = lists.sashes.find((s) =>
            (s.model || "").toUpperCase().includes("3200 SP HANDLE SGU")
          );
          sashConv = sashItem ? parseFloat(sashItem.conversionUnitKgPerMtr) || 0 : 0;
          sashPara = sashItem ? parseFloat(sashItem.parameter) || 0 : 0;

          // Select frame based on typology
          if (typologyName.startsWith("2 TRACK")) {
            const frameItem = lists.frames.find((f) =>
              (f.model || "").toUpperCase().includes("3200 SP 2 TRACK")
            
            );
            frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
            framePara = frameItem ? parseFloat(frameItem.parameter) || 0 : 0;
            console.log(frameItem);
          } else if (typologyName.startsWith("3 TRACK")) {
            const frameItem = lists.frames.find((f) =>
              (f.model || "").toUpperCase().includes("3200 SP 3 TRACK")
            );
            frameConv = frameItem ? parseFloat(frameItem.conversionUnitKgPerMtr) || 0 : 0;
            framePara = frameItem ? parseFloat(frameItem.parameter) || 0 : 0;
          }else{console.error("Unknown typology:", typologyName);}

          switch (typologyName) {
            case "2 TRACK 2 SHUTTER":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 2) +
                  sashConv * widthM * 2) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 2) +
                  (sashPara / 1000) * (widthM * 2) +
                  (outsideInterlockPara / 1000) * heightM +
                  (insideInterlockPara / 1000) * heightM +
                  (railPara / 1000) * widthM * 2) *
                (finishItem?.rate || 0);
                
              hardwareAmount =
                rollerRate * 4 +
                skrew19X8Rate * 10 +
                cleatForFrameRate * 4 +
                cleatForShutterRate * 4 +
                shutterAngleRate * 4 +
                ssPattiRate * 8 +
                shutterAntiLiftRate * 2 +
                skrew19X7Rate * 2 +
                interLockCoverRate * 4 +
                skrew13X7Rate * 4 +
                brushRate * 2 +
                distancePiecesRate * 16 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 4 + heightM * 4) +
                woolpipeRate * (heightM * 2) +
                trackEPDMRate * (widthM * 2 + heightM * 4) +
                interlockEPDMRate * heightM * 2 +
                glassEPDMRate * (widthM * 2 + heightM * 4) +
                (glassPackerRate * (widthMM * 2 + heightMM * 4)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * aluminiumRate;
              railAmount = railConv * 2 * widthM * aluminiumRate;
              lockAmount = lockRate * 2;
              break;
            case "2 TRACK 3 SHUTTER":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 2) +
                  sashConv * widthM * 2) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 2) +
                  (sashPara / 1000) * (widthM * 2) +
                  (outsideInterlockPara / 1000) * heightM * 2 +
                  (insideInterlockPara / 1000) * heightM * 2 +
                  (railPara / 1000) * widthM * 2) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 6 +
                skrew19X8Rate * 16 +
                cleatForFrameRate * 4 +
                cleatForShutterRate * 4 +
                shutterAngleRate * 8 +
                ssPattiRate * 8 +
                shutterAntiLiftRate * 3 +
                skrew19X7Rate * 3 +
                interLockCoverRate * 8 +
                skrew13X7Rate * 8 +
                brushRate * 4 +
                distancePiecesRate * 24 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 4 + heightM * 4) +
                woolpipeRate * (heightM * 4) +
                trackEPDMRate * (widthM * 2 + heightM * 4) +
                interlockEPDMRate * heightM * 4 +
                glassEPDMRate * (widthM * 2 + heightM * 6) +
                (glassPackerRate * (widthMM * 2 + heightMM * 6)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * 2 * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * 2 * aluminiumRate;
              railAmount = railConv * 2 * widthM * aluminiumRate;
              lockAmount = lockRate * 2;
              break;
            case "2 TRACK 4 SHUTTER":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 4) +
                  sashConv * widthM * 2 +
                  middleConv * heightM) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 4) +
                  (sashPara / 1000) * (widthM * 2) +
                  (outsideInterlockPara / 1000) * heightM * 2 +
                  (insideInterlockPara / 1000) * heightM * 2 +
                  (railPara / 1000) * widthM * 2 +
                  (middlePara / 1000) * heightM) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 8 +
                skrew19X8Rate * 20 +
                cleatForFrameRate * 4 +
                cleatForShutterRate * 8 +
                shutterAngleRate * 8 +
                ssPattiRate * 16 +
                shutterAntiLiftRate * 4 +
                skrew19X7Rate * 4 +
                interLockCoverRate * 8 +
                skrew13X7Rate * 8 +
                brushRate * 4 +
                distancePiecesRate * 32 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 4 + heightM * 8) +
                woolpipeRate * (heightM * 4) +
                trackEPDMRate * (widthM * 2 + heightM * 4) +
                interlockEPDMRate * heightM * 4 +
                glassEPDMRate * (widthM * 2 + heightM * 8) +
                (glassPackerRate * (widthMM * 2 + heightMM * 8)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * 2 * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * 2 * aluminiumRate;
              railAmount = railConv * 2 * widthM * aluminiumRate;
              lockAmount = lockRate * 3;

              break;
            case "3 TRACK 3 SHUTTER":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 2) +
                  sashConv * widthM * 2) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 2) +
                  (sashPara / 1000) * (widthM * 2) +
                  (outsideInterlockPara / 1000) * heightM * 2 +
                  (insideInterlockPara / 1000) * heightM * 2 +
                  (railPara / 1000) * widthM * 3) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 6 +
                skrew19X8Rate * 16 +
                cleatForFrameRate * 8 +
                cleatForShutterRate * 8 +
                shutterAngleRate * 12 +
                ssPattiRate * 16 +
                shutterAntiLiftRate * 6 +
                skrew19X7Rate * 6 +
                interLockCoverRate * 12 +
                skrew13X7Rate * 24 +
                brushRate * 6 +
                distancePiecesRate * 48 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 6 + heightM * 12) +
                woolpipeRate * (heightM * 6) +
                trackEPDMRate * (widthM * 3 + heightM * 6) +
                interlockEPDMRate * heightM * 4 +
                glassEPDMRate * (widthM * 2 + heightM * 6) +
                (glassPackerRate * (widthMM * 2 + heightMM * 6)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * 2 * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * 2 * aluminiumRate;
              railAmount = railConv * 3 * widthM * aluminiumRate;
              lockAmount = lockRate * 2;
              break;
            case "3 TRACK 6 SHUTTER":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 4) +
                  sashConv * widthM * 2 +
                  middleConv * heightM) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 4) +
                  (sashPara / 1000) * (widthM * 2) +
                  (outsideInterlockPara / 1000) * heightM * 4 +
                  (insideInterlockPara / 1000) * heightM * 4 +
                  (railPara / 1000) * widthM * 3 +
                  (middlePara / 1000) * heightM) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 12 +
                skrew19X8Rate * 30 +
                cleatForFrameRate * 8 +
                cleatForShutterRate * 4 +
                shutterAngleRate * 8 +
                ssPattiRate * 8 +
                shutterAntiLiftRate * 3 +
                skrew19X7Rate * 3 +
                interLockCoverRate * 8 +
                skrew13X7Rate * 16 +
                brushRate * 4 +
                distancePiecesRate * 24 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 4 + heightM * 4) +
                woolpipeRate * (heightM * 4) +
                trackEPDMRate * (widthM * 3 + heightM * 6) +
                interlockEPDMRate * heightM * 6 +
                glassEPDMRate * (widthM * 3 + heightM * 12) +
                (glassPackerRate * (widthMM * 3 + heightMM * 6)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * 4 * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * 4 * aluminiumRate;
              railAmount = railConv * 3 * widthM * aluminiumRate;
              lockAmount = lockRate * 3;
              break;
            case "3 TRACK 2 SHUTTER 1 MASH":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 3) +
                  sashConv * widthM * 3) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 3) +
                  (sashPara / 1000) * (widthM * 3) +
                  (outsideInterlockPara / 1000) * heightM * 1 +
                  (insideInterlockPara / 1000) * heightM * 1 +
                  (meshInterlockPara / 1000) * heightM * 1 +
                  (railPara / 1000) * widthM * 3) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 4 +
                nonrollerRate * 2 +
                pta25x8Rate * 4 +
                skrew19X8Rate * 12 +
                cleatForFrameRate * 8 +
                cleatForShutterRate * 6 +
                shutterAngleRate * 6 +
                ssPattiRate * 12 +
                shutterAntiLiftRate * 3 +
                skrew19X7Rate * 3 +
                interLockCoverRate * 6 +
                skrew13X7Rate * 12 +
                brushRate * 4 +
                distancePiecesRate * 24 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 6 + heightM * 6) +
                woolpipeRate * (heightM * 6) +
                trackEPDMRate * (widthM * 3 + heightM * 6) +
                interlockEPDMRate * heightM * 3 +
                glassEPDMRate * (widthM * 2 + heightM * 6) +
                (glassPackerRate * (widthMM * 3 + heightMM * 4)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * aluminiumRate;
              meshInterlockAmount = meshInterlockConv * heightM * aluminiumRate;
              railAmount = railConv * 3 * widthM * aluminiumRate;
              lockAmount = lockRate * 3;
              break;
            case "3 TRACK 3 SHUTTER 2 MASH (x-2x-x)":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 4) +
                  sashConv * widthM * 3 +
                  middleConv * heightM) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 4) +
                  (sashPara / 1000) * (widthM * 3) +
                  (outsideInterlockPara / 1000) * heightM * 2 +
                  (insideInterlockPara / 1000) * heightM * 2 +
                  (meshInterlockPara / 1000) * heightM * 2 +
                  (railPara / 1000) * widthM * 3 +
                  (middlePara / 1000) * heightM) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 6 +
                nonrollerRate * 4 +
                pta25x8Rate * 8 +
                skrew19X8Rate * 18 +
                cleatForFrameRate * 8 +
                cleatForShutterRate * 12 +
                shutterAngleRate * 12 +
                ssPattiRate * 24 +
                shutterAntiLiftRate * 6 +
                skrew19X7Rate * 6 +
                interLockCoverRate * 12 +
                skrew13X7Rate * 24 +
                brushRate * 6 +
                distancePiecesRate * 40 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 6 + heightM * 6) +
                woolpipeRate * (heightM * 6) +
                trackEPDMRate * (widthM * 3 + heightM * 6) +
                interlockEPDMRate * heightM * 6 +
                glassEPDMRate * (widthM * 3 + heightM * 10) +
                (glassPackerRate * (widthMM * 3 + heightMM * 6)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * 2 * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * 2 * aluminiumRate;
              meshInterlockAmount = meshInterlockConv * heightM * 2 * aluminiumRate;
              railAmount = railConv * 3 * widthM * aluminiumRate;
              lockAmount = lockRate * 4;
              break;
            case "3 TRACK 4 SHUTTER 2 MASH":
              typologyAmount =
                (frameConv * (widthM * 2 + heightM * 2) +
                  sashConv * (heightM * 6) +
                  sashConv * widthM * 3 +
                  middleConv * heightM) *
                aluminiumRate;
              finishAmount =
                ((framePara / 1000) * (widthM * 2 + heightM * 2) +
                  (sashPara / 1000) * (heightM * 6) +
                  (sashPara / 1000) * (widthM * 3) +
                  (outsideInterlockPara / 1000) * heightM * 2 +
                  (insideInterlockPara / 1000) * heightM * 2 +
                  (meshInterlockPara / 1000) * heightM * 2 +
                  (railPara / 1000) * widthM * 3 +
                  (middlePara / 1000) * heightM) *
                (finishItem?.rate || 0);
              hardwareAmount =
                rollerRate * 8 +
                nonrollerRate * 4 +
                pta25x8Rate * 8 +
                skrew19X8Rate * 22 +
                cleatForFrameRate * 8 +
                cleatForShutterRate * 12 +
                shutterAngleRate * 12 +
                ssPattiRate * 24 +
                shutterAntiLiftRate * 6 +
                skrew19X7Rate * 6 +
                interLockCoverRate * 12 +
                skrew13X7Rate * 24 +
                brushRate * 6 +
                distancePiecesRate * 48 +
                (widthMM / 550) * waterDrainageCoverRate +
                ((perimeterM * 1000) / 650) * wallSkrewRate +
                rowelPlugRate * ((perimeterM * 1000) / 650) +
                pushButtonRate * ((perimeterM * 1000) / 650) +
                packingRate * ((perimeterM * 1000) / 550) +
                woolpipeRate * (widthM * 6 + heightM * 12) +
                woolpipeRate * (heightM * 6) +
                trackEPDMRate * (widthM * 3 + heightM * 6) +
                interlockEPDMRate * heightM * 6 +
                glassEPDMRate * (widthM * 3 + heightM * 12) +
                (glassPackerRate * (widthMM * 3 + heightMM * 6)) / 650 +
                siliconRate * ((perimeterM * 2) / 9.5);
              insideInterlockAmount = insideInterlockConv * heightM * 2 * aluminiumRate;
              outsideInterlockAmount = outsideInterlockConv * heightM * 2 * aluminiumRate;
              meshInterlockAmount = meshInterlockConv * heightM * 2 * aluminiumRate;
              railAmount = railConv * 3 * widthM * aluminiumRate;
              lockAmount = lockRate * 4;
              break;
            default:
              console.warn(`Warning: No matching typology found for "${typologyName}"`);
              typologyAmount = 0;
              finishAmount = 0;
              fixedCharge = 0;
              break;
          }
        }
      } else if (seriesItem && seriesItem.series === "5000") {
      }
    }

    const totalPerUnit =
      typologyAmount +
      lockAmount +
      railAmount +
      glassAmount +
      insideInterlockAmount +
      meshInterlockAmount +
      outsideInterlockAmount +
      finishAmount +
      hardwareAmount;
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
      aluminiumRate,
      railAmount,
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
  const discountRate = +header.discount || 0;
  useEffect(() => {
    if (mode === "edit" || mode === "add") {
      setRows((prevRows) => prevRows.map(handleRow));
    }
  }, [header.alluminum, header.discount]);
  useEffect(() => {
    if (mode === "edit" || mode === "add") {
      setRows((prevRows) => prevRows.map(handleRow));
    }
  }, [header.fabrication, header.installation]);

  // 🧠 Sum all sqm from rows
  const totalSqm = rows.reduce((sum, r) => sum + (+r.sqm || 0), 0);

  const fabricationAmt = totalSqm * fabricationPerSqm;
  const installationAmt = totalSqm * installationPerSqm;

  const taxable = rowsAmt + fabricationAmt + installationAmt;

  const taxAmt =
    header.location === "gujarat"
      ? taxable * ((+header.cgst + +header.sgst) / 100)
      : taxable * (+header.igst / 100);
  const discountAmt = ((taxable + taxAmt) * (parseFloat(header.discount) || 0)) / 100;
  const grand = (taxable + taxAmt - discountAmt).toFixed(2);

  async function saveQuotation() {
    try {
      if (rows.length === 0) {
        alert("Please add at least one product row");
        return;
      }

      const payload = {
        header: {
          location: header.location,
          cgst: parseFloat(header.cgst) || 9,
          sgst: parseFloat(header.sgst) || 9,
          igst: parseFloat(header.igst) || 18,
          alluminum: parseFloat(header.alluminum) || 300,
          discount: parseFloat(header.discount) || 0,
          fabrication: fabricationPerSqm,
          installation: installationPerSqm,
          projectId: header.projectId,
        },
        rows: rows.map((row) => ({
          ...row,
          glass: lists.glasses.find((g) => g._id === row.glass)?._id || row.glass,
          finish: lists.finishes.find((f) => f._id === row.finish)?._id || row.finish,
          lock: lists.locks.find((l) => l._id === row.lock)?._id || row.lock,
          rail: lists.rails.find((r) => r._id === row.rail)?._id || row.rail,
          insideInterlock:
            lists.interlocks.find((i) => i._id === row.insideInterlock)?._id || row.insideInterlock,
          outsideInterlock:
            lists.interlocks.find((i) => i._id === row.outsideInterlock)?._id ||
            row.outsideInterlock,
          amount: parseFloat(row.amount) || 0,
          qty: parseInt(row.qty) || 1,
        })),
        totalAmt: taxable,
        taxAmt,
        grand,
        fabricationAmt,
        installationAmt,
        discountAmt,
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
            glass: lists.glasses.find((g) => g.title === row.glass)?._id || row.glass,
            finish: lists.finishes.find((f) => f.title === row.finish)?._id || row.finish,
            lock: lists.locks.find((l) => l.title === row.lock)?._id || row.lock,
            rail: lists.rails.find((r) => r.model === row.rail)?._id || row.rail,
            insideInterlock:
              lists.interlocks.find((i) => i.model === row.insideInterlock)?._id ||
              row.insideInterlock,
            outsideInterlock:
              lists.interlocks.find((i) => i.model === row.outsideInterlock)?._id ||
              row.outsideInterlock,
            amount: parseFloat(row.amount) || 0,
            qty: parseInt(row.qty) || 1,
          }));

          const omitRevision = (obj) => {
            const { revision, ...rest } = obj || {};
            return rest;
          };
          const cleanedOriginal = {
            header: omitRevision({
              ...originalData.header,
              cgst: +originalData.header.cgst || 0,
              sgst: +originalData.header.sgst || 0,
              igst: +originalData.header.igst || 0,
              fabrication: +originalData.header.fabrication || 0,
              installation: +originalData.header.installation || 0,
              alluminum: +originalData.header.alluminum || 0,
              discount: +originalData.header.discount || 0,
              fixedCharge: +originalData.header.fixedCharge || 0,
              projectId: originalData.header.projectId,

              location: originalData.header.location,
            }),
            rows: originalData.rows.map((r) => ({
              ...r,
              qty: +r.qty,
              amount: +r.amount,
            })),
            totalAmt: +originalData.totalAmt,
            taxAmt: +originalData.taxAmt,
            grand: +originalData.grand,
          };

          const cleanedPayload = {
            header: omitRevision({
              ...payload.header,
              cgst: +payload.header.cgst || 0,
              sgst: +payload.header.sgst || 0,
              igst: +payload.header.igst || 0,
              fabrication: +payload.header.fabrication || 0,
              installation: +payload.header.installation || 0,
              alluminum: +payload.header.alluminum || 0,
              discount: +payload.header.discount || 0,
              fixedCharge: +payload.header.fixedCharge || 0,
              projectId: payload.header.projectId,

              location: payload.header.location,
            }),
            rows: payload.rows.map((r) => ({
              ...r,
              qty: +r.qty,
              amount: +r.amount,
            })),
            totalAmt: +payload.totalAmt,
            taxAmt: +payload.taxAmt,
            grand: +payload.grand,
          };

          if (_.isEqual(cleanedOriginal, cleanedPayload)) {
            console.log("✅ No changes detected. Quotation not updated.");
            alert("No changes detected. Quotation was not updated.");
            return;
          }

          // Step 2: Tabular console logging of changes
          console.warn("🔍 Changes detected between original and payload");

          const changes = [];

          // Compare header fields
          Object.keys(cleanedPayload.header).forEach((key) => {
            const oldVal = cleanedOriginal.header?.[key];
            const newVal = cleanedPayload.header?.[key];
            if (!_.isEqual(oldVal, newVal)) {
              changes.push({
                Section: "Header",
                Field: key,
                From: oldVal,
                To: newVal,
              });
            }
          });

          // Compare row fields
          cleanedPayload.rows.forEach((row, i) => {
            const originalRow = cleanedOriginal.rows[i];
            if (!originalRow) {
              changes.push({
                Section: `Row ${i + 1}`,
                Field: "(New Row)",
                From: "-",
                To: JSON.stringify(row),
              });
              return;
            }

            Object.keys(row).forEach((key) => {
              if (key === "hardwareDetails") return;
              if (!_.isEqual(row[key], originalRow[key])) {
                changes.push({
                  Section: `Row ${i + 1}`,
                  Field: key,
                  From: originalRow[key],
                  To: row[key],
                });
              }
            });
          });

          // Handle removed rows
          if (cleanedPayload.rows.length < cleanedOriginal.rows.length) {
            for (let i = cleanedPayload.rows.length; i < cleanedOriginal.rows.length; i++) {
              changes.push({
                Section: `Row ${i + 1}`,
                Field: "(Removed Row)",
                From: JSON.stringify(cleanedOriginal.rows[i]),
                To: "-",
              });
            }
          }

          // Print all changes as a table
          console.table(changes);
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
  const isDifferent = (field, rowIndex) => {
    if (!prevRevision || !prevRevision.rows?.[rowIndex]) return false;
    return quotation.rows[rowIndex]?.[field] !== prevRevision.rows[rowIndex]?.[field];
  };

  const currentRevisionIndex = revisions.findIndex((r) => r._id === quotationId);
  const preRevision = revisions[currentRevisionIndex - 1] || null;

  return (
    <div className="flex justify-center">
      <div className="p-6 w-full max-w-[1400px]">
        {header.revision !== undefined && (
          <p className="text-sm text-gray-500 mb-1">
            Revision: <b>R{header.revision}</b>
          </p>
        )}
        {(mode==="edit"||mode==="add") &&<h2 className="text-3xl font-bold mb-4" style={FONT}>
          Quotation Editor
        </h2>}
         {(mode==="view") &&<h2 className="text-3xl font-bold mb-4" style={FONT}>
          Quotation Viewer
        </h2>}
        {typeof mode === "string" && mode.toLowerCase() === "view" && revisions.length > 1 && (
          <div className="mb-4">
            <label className="text-sm font-medium" style={FONT}>
              Revision:
            </label>
            <select
              className="ml-2 border px-2 py-1 text-xs rounded"
              value={quotationId}
              onChange={(e) => nav(`/quotation/${e.target.value}`)}
            >
              {revisions.map((r) => (
                <option key={r._id} value={r._id}>
                  R{r.header.revision ?? 0}
                </option>
              ))}
            </select>
          </div>
        )}
        {mode === "view" && preRevision && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2 text-red-600">
              Differences from previous revision (R{preRevision.header.revision})
            </h3>
            <table className="w-full border text-xs mb-4">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Type</th>
                  <th className="border px-2 py-1">Field</th>
                  <th className="border px-2 py-1">Old Value</th>
                  <th className="border px-2 py-1">New Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Header differences */}
                {Object.keys(quotation.header || {}).map((key) => {
                  const oldVal = preRevision.header?.[key];
                  const newVal = quotation.header?.[key];
                  if (!_.isEqual(oldVal, newVal)) {
                    return (
                      <tr key={`header-${key}`} className="bg-yellow-50">
                        <td className="border px-2 py-1">Header</td>
                        <td className="border px-2 py-1">{key}</td>
                        <td className="border px-2 py-1">{String(oldVal)}</td>
                        <td className="border px-2 py-1">{String(newVal)}</td>
                      </tr>
                    );
                  }
                  return null;
                })}

                {/* Row differences */}
                {quotation.rows.map((row, idx) => {
                  const oldRow = preRevision.rows[idx];
                  if (!oldRow) {
                    return (
                      <tr key={`row-added-${idx}`} className="bg-green-50">
                        <td className="border px-2 py-1">Row {idx + 1}</td>
                        <td className="border px-2 py-1" colSpan={3}>
                          ➕ New row added
                        </td>
                      </tr>
                    );
                  }

                  return Object.keys(row).map((key) => {
                    if (key === "hardwareDetails") return null;
                    const oldVal = oldRow[key];
                    const newVal = row[key];
                    if (!_.isEqual(oldVal, newVal)) {
                      return (
                        <tr key={`row-${idx}-${key}`} className="bg-yellow-50">
                          <td className="border px-2 py-1">Row {idx + 1}</td>
                          <td className="border px-2 py-1">{key}</td>
                          <td className="border px-2 py-1">{String(oldVal)}</td>
                          <td className="border px-2 py-1">{String(newVal)}</td>
                        </tr>
                      );
                    }
                    return null;
                  });
                })}

                {/* Row count changes */}
                {preRevision.rows.length > quotation.rows.length && (
                  <tr className="bg-red-50">
                    <td className="border px-2 py-1">Rows</td>
                    <td className="border px-2 py-1" colSpan={3}>
                      🗑 {preRevision.rows.length - quotation.rows.length} row(s) were removed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mb-6">
          <div className="w-37">
            <label className="font-medium block mb-1" style={FONT}>
              Aluminum Rate
            </label>
            <input
              type="number"
              value={header.alluminum}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  alluminum: e.target.value === "" ? "" : parseFloat(e.target.value),
                }))
              }
              readOnly={mode === "view"}
              tabIndex={mode === "view" ? -1 : undefined} // disable tab in view mode
              className={`border rounded px-3 py-2 text-xs w-full ${
                mode === "view" ? "bg-gray-100 cursor-default pointer-events-none" : "bg-white"
              }`}
              style={FONT}
            />
          </div>
        </div>

        {(mode === "edit" || mode === "add") && (
          <button
            onClick={() => setModal({ type: "add", index: null })}
            className="flex items-center gap-1 bg-[#74bbbd] text-white px-4 py-2 rounded text-sm mb-4"
            style={FONT}
          >
            <Plus size={14} /> Add Product Row
          </button>
        )}

        {rows.length ? (
          <div className="w-full overflow-x-auto">
            <table className="table-fixed min-w-[1000px] border text-xs mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className={`${cellCls} w-6`}>Sr</th>
                  <th className={`${cellCls} w-24`}>Series</th>
                  <th className={`${cellCls} w-28`}>Typology</th>
                  <th className={`${cellCls} w-20`}>W(mm)</th>
                  <th className={`${cellCls} w-20`}>H(mm)</th>
                  <th className={`${cellCls} w-32`}>Inside-Interlock</th>
                  <th className={`${cellCls} w-20`}>Mesh-Interlock</th>
                  <th className={`${cellCls} w-32`}>Outside-Interlock</th>
                  <th className={`${cellCls} w-28`}>Rail</th>
                  <th className={`${cellCls} w-24`}>Finish</th>
                  <th className={`${cellCls} w-24`}>Lock</th>
                  <th className={`${cellCls} w-24`}>Glass</th>
                  <th className={`${cellCls} w-16`}>Qty</th>
                  <th className={`${cellCls} w-20`}>SqFt</th>
                  <th className={`${cellCls} w-20`}>SqM</th>
                  <th className={`${cellCls} w-24`}>Amount</th>
                  <th className={`${cellCls} w-24`}>Rate/sqFt</th>
                  <th className={`${cellCls} w-24`}>Rate/sqM</th>
                  {(mode === "edit" ||mode==="add")&& <th className={`${cellCls} w-28`}>Actions</th>}
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
                        {lists.typologiesBySeries[r.series]?.find((t) => t._id === r.typology)
                          ?.title ||
                          r.typology ||
                          "-"}
                      </td>
                      <td className={cellCls}>{r.widthMM || "-"}</td>
                      <td className={cellCls}>{r.heightMM || "-"}</td>
                      <td className={cellCls}>
                        {lists.interlocks.find((i) => i._id === r.insideInterlock)?.model ||
                          r.insideInterlock ||
                          "-"}
                      </td>
                      <td className={cellCls}>
                        {lists.interlocks.find((i) => i._id === r.meshInterlock)?.model ||
                          r.meshInterlock ||
                          "-"}
                      </td>
                      <td className={cellCls}>
                        {lists.interlocks.find((i) => i._id === r.outsideInterlock)?.model ||
                          r.outsideInterlock ||
                          "-"}
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
                      <td className={cellCls}>{r.rateType === "sqft" ? r.rateSqFt : r.rateSqM}</td>
                      <td className={cellCls}>{r.rateType === "sqM" ? r.rateSqM : r.rateSqM}</td>
                      {(mode === "edit" ||mode==="adda") && (
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
          </div>
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
            <label className="font-medium" style={FONT}>
              Fabrication Charges (per SqM)
            </label>
            <input
              type="number"
              value={header.fabrication}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  fabrication: e.target.value === "" ? "" : parseFloat(e.target.value),
                }))
              }
              readOnly={mode === "view"}
              tabIndex={mode === "view" ? -1 : undefined} // disable tab in view mode
              className={`border rounded px-3 py-2 text-xs w-full ${
                mode === "view" ? "bg-gray-100 cursor-default pointer-events-none" : "bg-white"
              }`}
              style={FONT}
            />
          </div>
          <div>
            <label className="font-medium" style={FONT}>
              Installation Charges (per SqM)
            </label>
            <input
              type="number"
              value={header.installation}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  installation: e.target.value === "" ? "" : parseFloat(e.target.value),
                }))
              }
              readOnly={mode === "view"}
              tabIndex={mode === "view" ? -1 : undefined} // disable tab in view mode
              className={`border rounded px-3 py-2 text-xs w-full ${
                mode === "view" ? "bg-gray-100 cursor-default pointer-events-none" : "bg-white"
              }`}
              style={FONT}
            />
          </div>
        </div>
        <div className="flex justify-end mb-6">
          <div className="w-37">
            <label className="font-medium block mb-1" style={FONT}>
              Discount
            </label>
            <input
              type="number"
              value={header.discount}
              onChange={(e) =>
                setHeader((h) => ({
                  ...h,
                  discount: parseFloat(e.target.value) || 0,
                }))
              }
              readOnly={mode === "view"}
              tabIndex={mode === "view" ? -1 : undefined} // disable tab in view mode
              className={`border rounded px-3 py-2 text-xs w-full ${
                mode === "view" ? "bg-gray-100 cursor-default pointer-events-none" : "bg-white"
              }`}
              style={FONT}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <label className="font-medium" style={FONT}>
              Location
            </label>
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
                <label className="font-medium" style={FONT}>
                  CGST %
                </label>
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
                <label className="font-medium" style={FONT}>
                  SGST %
                </label>
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
              <label className="font-medium" style={FONT}>
                IGST %
              </label>
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
          <p>
            Products Amount: <b>{rowsAmt.toFixed(2)}</b>
          </p>
          <p>
            Fabrication Charges: <b>{fabricationAmt.toFixed(2)}</b>
          </p>
          <p>
            Installation Charges: <b>{installationAmt.toFixed(2)}</b>
          </p>
          <p>
            Total Amount (Before Tax): <b>{taxable.toFixed(2)}</b>
          </p>
          <p>
            Taxes: <b>{taxAmt.toFixed(2)}</b>
          </p>
          <p>
            Discount: <b>{discountAmt.toFixed(2)}</b>
          </p>
          <p className="text-xl">
            Grand Total: <b>{grand}</b>
          </p>
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
              className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded text-sm"
              style={FONT}
            >
              <Printer size={16} /> Print
            </button>
          )}
          {mode === "view" && quotationId && (
            <button
              onClick={() => nav(`/mto/${quotationId}`, "_blank")}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm"
            >
              <FileText size={16} />
              MTO
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
