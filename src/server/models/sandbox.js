export default {
  id: { type: Number, index: true },
  lang: { type: String },
  name: { type: String, index: true },
  events: [{             // event
    action: String,
    event: Object,
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}