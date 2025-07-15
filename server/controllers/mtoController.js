const MTO = require("../models/MTO");
const QuotationEditor = require("../models/QuotationEditor");
const Aluminium = require("../models/Aluminium");
const Glass = require("../models/Glass");
const Lock = require("../models/Lock");
const Finish = require("../models/Finish");
const Hardware = require("../models/Hardware");

exports.generateMTO = async (req, res) => {
  const { quotationId } = req.params;
  console.log("🔧 Generating Full MTO for:", quotationId);

  try {
    const quotation = await QuotationEditor.findById(quotationId);
    if (!quotation) return res.status(404).json({ msg: "Quotation not found" });

    const rows = quotation.rows || [];

    // 🧠 Load all reference data
    const [allGlass, allLocks, allFinish, allAluminium, allHardware] = await Promise.all([
      Glass.find(),
      Lock.find(),
      Finish.find(),
      Aluminium.find(),
      Hardware.find()
    ]);

    const resolveTitle = (arr, id) =>
      arr.find((i) => i._id.toString() === id?.toString() || i.title === id || i.model === id);

    const components = [];
    const hardwareMap = {};
    // 🧱 Collect Items
    for (const row of rows) {
      const qty = +row.qty || 1;
      const sqft = +row.sqft || 0;
      const sqm = +row.sqm || 0;

      // --- GLASS
      const glass = resolveTitle(allGlass, row.glass);
      if (glass) {
        components.push({ label: `GLASS • ${glass.title}`, qty, sqft, sqm });
      }

      // --- LOCK
      const lock = resolveTitle(allLocks, row.lock);
      if (lock) {
        components.push({ label: `LOCK • ${lock.title}`, qty, sqft, sqm });
      }

      // --- FINISH
      const finish = resolveTitle(allFinish, row.finish);
      if (finish) {
        components.push({ label: `FINISH • ${finish.title}`, qty, sqft, sqm });
      }

      // --- ALUMINIUM GROUP (Rail, Interlocks)
      const aluminiumFields = [
        { key: 'rail', label: 'RAIL' },
        { key: 'insideInterlock', label: 'INSIDE INTERLOCK' },
        { key: 'outsideInterlock', label: 'OUTSIDE INTERLOCK' },
        { key: 'meshInterlock', label: 'MESH INTERLOCK' }
      ];

      for (const { key, label } of aluminiumFields) {
        const id = row[key];
        const item = allAluminium.find(a => a._id.toString() === id?.toString() || a.model === id);
        if (item) {
          components.push({
            label: `${label} • ${item.model} (${item.make})`,
            qty,
            sqft,
            sqm
          });
        }
      }

      // --- TYPLOGY ALUMINIUM (frame/sash/middle) - Optional if model saved
      if (row.typology) {
        components.push({
          label: `ALUMINIUM • ${row.typology}`,
          qty,
          sqft,
          sqm
        });
      }

      // --- HARDWARE
if (row.hardwareDetails) {
  for (const [key, item] of Object.entries(row.hardwareDetails)) {
    const label = key.toUpperCase().replace(/([A-Z])/g, ' $1').trim();
    const id = item.vendorCode;

    if (!hardwareMap[id]) {
      hardwareMap[id] = {
        label: `HARDWARE • ${label}`,
        qty: 1,
        sqft: 0,
        sqm: 0,
      };
    } else {
      hardwareMap[label].qty += 1;
    }
  }
}

    }
    for (const item of Object.values(hardwareMap)) {
  components.push(item);
}
    // 🧮 Group by label
    const grouped = {};
    for (const c of components) {
      if (!grouped[c.label]) {
        grouped[c.label] = { ...c };
      } else {
        grouped[c.label].qty += c.qty;
        grouped[c.label].sqft += c.sqft;
        grouped[c.label].sqm += c.sqm;
      }
    }

    const items = Object.entries(grouped).map(([label, data]) => ({
      label,
      qty: data.qty,
      sqft: +data.sqft.toFixed(2),
      sqm: +data.sqm.toFixed(2),
    }));

    // Replace old MTO
    await MTO.deleteOne({ quotationId });

    const newMTO = await MTO.create({
      quotationId,
      projectId: quotation.header.projectId,
      items,
    });

    console.log("✅ MTO created:", newMTO.items.length, "items");
    console.log("MTO items:", newMTO.items);
    res.status(201).json(newMTO);
  } catch (err) {
    console.error("🔴 Error generating MTO:", err.message);
    res.status(500).json({ msg: "Failed to generate MTO", error: err.message });
  }
};

exports.getByQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const mto = await MTO.findOne({ quotationId });
    if (!mto) return res.status(404).json({ msg: "MTO not found for this quotation" });
    res.json(mto);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch MTO", error: err.message });
  }
};