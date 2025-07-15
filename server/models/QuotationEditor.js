// models/QuotationEditor.js
const { Schema, model } = require('mongoose');

const rowSchema = new Schema({
  series: String,
  typology: String,
  insideInterlock: String,
  meshInterlock:String,
  outsideInterlock: String,
  rail: String,
  finish: String,
  glass: String,
  lock: String,
  widthMM: Number,
  heightMM: Number,
  qty: Number,
  sqft: String,
  sqm: String,
  rateSqFt: String,
  rateSqM: String,
  rateType: String,
  amount: String
}, { _id: false });

const quotationEditorSchema = new Schema({
  header: {
    clientName: String,
    clientCity: String,
    location: String,
    cgst: Number,
    alluminum:Number,
    sgst: Number,
    igst: Number,
    fabrication: Number,
    installation: Number,
    fixedCharge: Number,
    discount: { type: Number, default: 0 },
    projectId: { type: String, required: true },
    revision: { type: Number, default: 0 },
  },
  
  rows: [rowSchema],
  totalAmt: Number,
  taxAmt: Number,
  grand: Number
}, { timestamps: false });

module.exports = model('QuotationEditor', quotationEditorSchema);
