import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// ─── VIT SLOT → DAY/TIME MAP ── exact from official VIT slot chart ─────────────
// Key insight: theory slots A1-G2 appear on TWO days each week.
// resolveSlot() returns an ARRAY of {day,time} entries.
const MULTI_SLOT = {
  // Slot: [ {day, time}, {day, time} ]  (two sessions per week)
  A1:  [{day:"Mon",time:"08:00–08:50"},{day:"Wed",time:"09:00–09:50"}],
  F1:  [{day:"Mon",time:"09:00–09:50"},{day:"Wed",time:"10:00–10:50"}],
  D1:  [{day:"Mon",time:"10:00–10:50"},{day:"Thu",time:"08:00–08:50"}],
  TB1: [{day:"Mon",time:"11:00–11:50"}],
  TG1: [{day:"Mon",time:"12:00–12:50"}],
  A2:  [{day:"Mon",time:"14:00–14:50"},{day:"Wed",time:"15:00–15:50"}],
  F2:  [{day:"Mon",time:"15:00–15:50"},{day:"Wed",time:"16:00–16:50"}],
  D2:  [{day:"Mon",time:"16:00–16:50"},{day:"Thu",time:"14:00–14:50"}],
  TB2: [{day:"Mon",time:"17:00–17:50"}],
  TG2: [{day:"Mon",time:"18:00–18:50"}],

  B1:  [{day:"Tue",time:"08:00–08:50"},{day:"Thu",time:"09:00–09:50"}],
  G1:  [{day:"Tue",time:"09:00–09:50"},{day:"Thu",time:"10:00–10:50"}],
  E1:  [{day:"Tue",time:"10:00–10:50"},{day:"Fri",time:"08:00–08:50"}],
  TC1: [{day:"Tue",time:"11:00–11:50"}],
  TAA1:[{day:"Tue",time:"12:00–12:50"}],
  B2:  [{day:"Tue",time:"14:00–14:50"},{day:"Thu",time:"15:00–15:50"}],
  G2:  [{day:"Tue",time:"15:00–15:50"},{day:"Thu",time:"16:00–16:50"}],
  E2:  [{day:"Tue",time:"16:00–16:50"},{day:"Fri",time:"14:00–14:50"}],
  TC2: [{day:"Tue",time:"17:00–17:50"}],
  TAA2:[{day:"Tue",time:"18:00–18:50"}],

  C1:  [{day:"Wed",time:"08:00–08:50"},{day:"Fri",time:"09:00–09:50"}],
  // A1 Wed 09:00 covered above
  // F1 Wed 10:00 covered above
  C2:  [{day:"Wed",time:"14:00–14:50"},{day:"Fri",time:"15:00–15:50"}],
  // A2 Wed 15:00 covered above
  // F2 Wed 16:00 covered above
  TD2: [{day:"Wed",time:"17:00–17:50"}],
  TBB2:[{day:"Wed",time:"18:00–18:50"}],

  TE1: [{day:"Thu",time:"11:00–11:50"}],
  TCC1:[{day:"Thu",time:"12:00–12:50"}],
  // D2 Thu 14:00 covered above
  // B2 Thu 15:00 covered above
  // G2 Thu 16:00 covered above
  TE2: [{day:"Thu",time:"17:00–17:50"}],
  TCC2:[{day:"Thu",time:"18:00–18:50"}],

  // E1 Fri 08:00 covered above
  // C1 Fri 09:00 covered above
  TA1: [{day:"Fri",time:"10:00–10:50"}],
  TF1: [{day:"Fri",time:"11:00–11:50"}],
  TD1: [{day:"Fri",time:"12:00–12:50"}],
  // E2 Fri 14:00 covered above
  // C2 Fri 15:00 covered above
  TA2: [{day:"Fri",time:"16:00–16:50"}],
  TF2: [{day:"Fri",time:"17:00–17:50"}],
  TDD2:[{day:"Fri",time:"18:00–18:50"}],
}

// LAB slots — single session each, exact from chart
const LAB_SLOT = {
  // Monday
  L1: {day:"Mon",time:"08:00–08:50"},  L2: {day:"Mon",time:"08:51–09:40"},
  L3: {day:"Mon",time:"09:51–10:40"},  L4: {day:"Mon",time:"10:41–11:30"},
  L5: {day:"Mon",time:"11:40–12:30"},  L6: {day:"Mon",time:"12:31–13:20"},
  L31:{day:"Mon",time:"14:00–14:50"},  L32:{day:"Mon",time:"14:51–15:40"},
  L33:{day:"Mon",time:"15:51–16:40"},  L34:{day:"Mon",time:"16:41–17:30"},
  L35:{day:"Mon",time:"17:40–18:30"},  L36:{day:"Mon",time:"18:31–19:20"},
  // Tuesday
  L7: {day:"Tue",time:"08:00–08:50"},  L8: {day:"Tue",time:"08:51–09:40"},
  L9: {day:"Tue",time:"09:51–10:40"},  L10:{day:"Tue",time:"10:41–11:30"},
  L11:{day:"Tue",time:"11:40–12:30"},  L12:{day:"Tue",time:"12:31–13:20"},
  L37:{day:"Tue",time:"14:00–14:50"},  L38:{day:"Tue",time:"14:51–15:40"},
  L39:{day:"Tue",time:"15:51–16:40"},  L40:{day:"Tue",time:"16:41–17:30"},
  L41:{day:"Tue",time:"17:40–18:30"},  L42:{day:"Tue",time:"18:31–19:20"},
  // Wednesday
  L13:{day:"Wed",time:"08:00–08:50"},  L14:{day:"Wed",time:"08:51–09:40"},
  L15:{day:"Wed",time:"09:51–10:40"},  L16:{day:"Wed",time:"10:41–11:30"},
  L17:{day:"Wed",time:"11:40–12:30"},  L18:{day:"Wed",time:"12:31–13:20"},
  L43:{day:"Wed",time:"14:00–14:50"},  L44:{day:"Wed",time:"14:51–15:40"},
  L45:{day:"Wed",time:"15:51–16:40"},  L46:{day:"Wed",time:"16:41–17:30"},
  L47:{day:"Wed",time:"17:40–18:30"},  L48:{day:"Wed",time:"18:31–19:20"},
  // Thursday
  L19:{day:"Thu",time:"08:00–08:50"},  L20:{day:"Thu",time:"08:51–09:40"},
  L21:{day:"Thu",time:"09:51–10:40"},  L22:{day:"Thu",time:"10:41–11:30"},
  L23:{day:"Thu",time:"11:40–12:30"},  L24:{day:"Thu",time:"12:31–13:20"},
  L49:{day:"Thu",time:"14:00–14:50"},  L50:{day:"Thu",time:"14:51–15:40"},
  L51:{day:"Thu",time:"15:51–16:40"},  L52:{day:"Thu",time:"16:41–17:30"},
  L53:{day:"Thu",time:"17:40–18:30"},  L54:{day:"Thu",time:"18:31–19:20"},
  // Friday
  L25:{day:"Fri",time:"08:00–08:50"},  L26:{day:"Fri",time:"08:51–09:40"},
  L27:{day:"Fri",time:"09:51–10:40"},  L28:{day:"Fri",time:"10:41–11:30"},
  L29:{day:"Fri",time:"11:40–12:30"},  L30:{day:"Fri",time:"12:31–13:20"},
  L55:{day:"Fri",time:"14:00–14:50"},  L56:{day:"Fri",time:"14:51–15:40"},
  L57:{day:"Fri",time:"15:51–16:40"},  L58:{day:"Fri",time:"16:41–17:30"},
  L59:{day:"Fri",time:"17:40–18:30"},  L60:{day:"Fri",time:"18:31–19:20"},
  // Saturday
  L71:{day:"Sat",time:"08:00–08:50"},  L72:{day:"Sat",time:"08:51–09:40"},
  L73:{day:"Sat",time:"09:51–10:40"},  L74:{day:"Sat",time:"10:41–11:30"},
  L75:{day:"Sat",time:"11:40–12:30"},  L76:{day:"Sat",time:"12:31–13:20"},
  L77:{day:"Sat",time:"14:00–14:50"},  L78:{day:"Sat",time:"14:51–15:40"},
  L79:{day:"Sat",time:"15:51–16:40"},  L80:{day:"Sat",time:"16:41–17:30"},
  L81:{day:"Sat",time:"17:40–18:30"},  L82:{day:"Sat",time:"18:31–19:20"},
}

// resolveSlot: returns array of {day,time} for any slot string
function resolveSlot(s) {
  if (LAB_SLOT[s]) return [LAB_SLOT[s]]
  if (MULTI_SLOT[s]) return MULTI_SLOT[s]
  return []
}

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat"]
const GRADE_POINTS = {S:10,A:9,B:8,C:7,D:6,E:5,F:0}
const MAX_CREDITS = 27
const COLORS = ["#f97316","#3b82f6","#a855f7","#ec4899","#10b981","#eab308","#06b6d4","#ef4444","#84cc16","#6366f1","#14b8a6","#f59e0b"]

function getGreeting() {
  const h = new Date().getHours()
  return h<12?"Good morning":h<17?"Good afternoon":"Good evening"
}

// ─── VIT timetable parser ─────────────────────────────────────────────────────
function parseVITText(text) {
  const courses = []
  // Split on numbered lines like "1\n" or "2\n"
  const lines = text.split("\n").map(l=>l.trim()).filter(Boolean)
  let i = 0
  while (i < lines.length) {
    // Look for a line that is just a number (serial no)
    if (/^\d+$/.test(lines[i])) {
      const block = lines.slice(i, i+20).join(" ")
      // Course code pattern: BXXX###L or BXXX###E or BXXX###P or BXXX###N or BXXX###M
      const codeMatch = block.match(/([A-Z]{4}\d{3}[A-Z0-9]+)\s*-\s*([^(]+)\(([^)]+)\)/)
      if (codeMatch) {
        const code = codeMatch[1].trim()
        const name = codeMatch[2].trim()
        const type = codeMatch[3].trim()
        // Credits
        const creditMatch = block.match(/\d+\s+\d+\s+\d+\s+\d+\s+([\d.]+)/)
        const credits = creditMatch ? parseFloat(creditMatch[1]) : 0
        // Slots — look for pattern like "A2+TA2" or "L5+L6+L13+L14" or "NIL"
        const slotMatch = block.match(/([A-Z0-9]+(?:\+[A-Z0-9]+)*)\s*-\s*([A-Z]{2,}\d+[A-Z]?\d*|NIL)/)
        const slots = slotMatch ? slotMatch[1].split("+") : ["NIL"]
        const venue = slotMatch ? slotMatch[2] : "NIL"
        // Faculty
        const facMatch = block.match(/([A-Z][A-Z ]+[A-Z])\s*-\s*(SCOPE|SENSE|SAS|SSL|SITE|SMEC|SELECT|SBS|SCALE)/i)
        const faculty = facMatch ? facMatch[1].trim() : "—"
        courses.push({
          code, name, type, credits, slots, venue, faculty,
          id: code+"_"+type.replace(/\s/g,"").slice(0,6),
          color: COLORS[courses.length % COLORS.length]
        })
      }
      i++
    } else { i++ }
  }
  return courses
}

// ─── CGPA Calculator ──────────────────────────────────────────────────────────
function CGPACalculator() {
  const [subs, setSubs] = useState([{name:"",credits:"",grade:"S"}])
  const [result, setResult] = useState(null)
  const [err, setErr] = useState("")
  const used = subs.reduce((s,x)=>s+(parseInt(x.credits)||0),0)
  const col = v=>v>=9?"#4ade80":v>=8?"orange":v>=6?"#facc15":"#f87171"
  const lbl = v=>v>=9?"Outstanding 🏆":v>=8?"Excellent 🌟":v>=7?"Good 👍":v>=6?"Average 📘":"Needs Improvement 💪"
  function upd(i,f,v){
    const u=subs.map((s,j)=>j===i?{...s,[f]:v}:s)
    if(f==="credits"){const nt=u.reduce((s,x)=>s+(parseInt(x.credits)||0),0);if(nt>MAX_CREDITS){setErr(`Max ${MAX_CREDITS} credits.`);return};setErr("")}
    setSubs(u);setResult(null)
  }
  function calc(){
    setErr("")
    for(let i=0;i<subs.length;i++){
      if(!subs[i].name.trim()){setErr(`Subject ${i+1}: enter name.`);return}
      if(!parseInt(subs[i].credits)||parseInt(subs[i].credits)<1){setErr(`Subject ${i+1}: enter credits.`);return}
    }
    const tc=subs.reduce((s,x)=>s+parseInt(x.credits),0)
    const ws=subs.reduce((s,x)=>s+GRADE_POINTS[x.grade]*parseInt(x.credits),0)
    setResult({cgpa:(ws/tc).toFixed(2),tc,ws})
  }
  return (
    <div className="cgpa-wrap">
      <div className="cgpa-header">
        <div><h2 className="cgpa-title">CGPA Calculator</h2><p className="cgpa-sub">VIT grading — max {MAX_CREDITS} credits</p></div>
        <div className="credit-badge" style={{color:MAX_CREDITS-used<=3?"#f87171":"orange"}}>
          <span className="credit-num">{MAX_CREDITS-used}</span><span className="credit-label">credits left</span>
        </div>
      </div>
      <div className="grade-legend">
        {Object.entries(GRADE_POINTS).map(([g,p])=>(
          <div key={g} className="grade-chip"><span className="grade-letter">{g}</span><span className="grade-point">{p}</span></div>
        ))}
      </div>
      <div className="subjects-list">
        {subs.map((s,i)=>(
          <div key={i} className="subject-row">
            <div className="sub-num">{i+1}</div>
            <input className="sub-input sub-name" placeholder="Subject name" value={s.name} onChange={e=>upd(i,"name",e.target.value)}/>
            <input className="sub-input sub-credits" placeholder="Credits" type="number" min="1" max="6" value={s.credits} onChange={e=>upd(i,"credits",e.target.value)}/>
            <select className="sub-select" value={s.grade} onChange={e=>upd(i,"grade",e.target.value)}>
              {Object.keys(GRADE_POINTS).map(g=><option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
            </select>
            <button className="sub-remove" onClick={()=>{if(subs.length>1){setSubs(subs.filter((_,j)=>j!==i));setResult(null)}}}>✕</button>
          </div>
        ))}
      </div>
      {err&&<div className="cgpa-error">⚠️ {err}</div>}
      <div className="cgpa-actions">
        <button className="cgpa-btn-secondary" onClick={()=>{if(used<MAX_CREDITS){setSubs([...subs,{name:"",credits:"",grade:"S"}]);setErr("")}}} disabled={used>=MAX_CREDITS}>+ Add Subject</button>
        <button className="cgpa-btn-primary" onClick={calc}>Calculate CGPA</button>
        <button className="cgpa-btn-ghost" onClick={()=>{setSubs([{name:"",credits:"",grade:"S"}]);setResult(null);setErr("")}}>Reset</button>
      </div>
      {result&&(
        <div className="cgpa-result">
          <div className="result-glow" style={{background:col(parseFloat(result.cgpa))}}/>
          <div className="result-inner">
            <p className="result-label">Your CGPA</p>
            <div className="result-score" style={{color:col(parseFloat(result.cgpa))}}>{result.cgpa}</div>
            <div className="result-badge">{lbl(parseFloat(result.cgpa))}</div>
            <div className="result-formula">({result.ws} pts) ÷ ({result.tc} credits) = {result.cgpa}</div>
            <div className="result-breakdown">
              {subs.map((s,i)=>(
                <div key={i} className="breakdown-row">
                  <span className="br-name">{s.name||`Subject ${i+1}`}</span>
                  <span className="br-calc">{GRADE_POINTS[s.grade]} × {s.credits} = {GRADE_POINTS[s.grade]*parseInt(s.credits)}</span>
                  <span className="br-grade" style={{color:col(GRADE_POINTS[s.grade])}}>{s.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Subject Modal ────────────────────────────────────────────────────────────
function SubjectModal({subject,tasks,onAddTask,onDeleteTask,onClose}){
  const [form,setForm]=useState({title:"",type:"assignment",date:"",priority:"medium",hours:""})
  const subTasks=tasks.filter(t=>t.subjectId===subject.id)
  const todayStr=new Date().toISOString().split("T")[0]
  function submit(){
    if(!form.title.trim())return
    onAddTask({...form,subjectId:subject.id,subjectName:subject.name,id:Date.now(),done:false})
    setForm({title:"",type:"assignment",date:"",priority:"medium",hours:""})
  }
  const typeIcon={assignment:"📝",exam:"📋",quiz:"❓",study:"📚",lab:"🧪"}
  return(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-header" style={{borderLeft:`4px solid ${subject.color}`}}>
          <div>
            <div className="modal-code">{subject.code}</div>
            <div className="modal-name">{subject.name}</div>
            <div className="modal-meta">
              <span>{subject.type}</span><span>•</span><span>{subject.credits} cr</span><span>•</span><span>{subject.venue}</span><span>•</span><span>{subject.faculty}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-section">
          <p className="modal-section-title">📅 Class Schedule</p>
          <div className="slot-chips">
            {(!subject.slots||subject.slots[0]==="NIL")
              ?<span className="slot-nil">Online / NIL slot</span>
              :subject.slots.map(s=>{
                const infos=resolveSlot(s)
                return<div key={s} className="slot-chip" style={{borderColor:subject.color}}>
                  <span className="slot-code">{s}</span>
                  {infos.map((info,ii)=>(
                    <span key={ii} className="slot-time">{info.day} {info.time}</span>
                  ))}
                </div>
              })
            }
          </div>
        </div>
        <div className="modal-section">
          <p className="modal-section-title">➕ Add Task / Target</p>
          <div className="modal-form">
            <input className="field-in" placeholder="Task title (assignment, exam, etc.)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <div className="modal-row">
              <select className="field-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                <option value="assignment">📝 Assignment</option>
                <option value="exam">📋 Exam</option>
                <option value="quiz">❓ Quiz</option>
                <option value="study">📚 Study Target</option>
                <option value="lab">🧪 Lab Record</option>
              </select>
              <select className="field-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option value="high">🔴 High</option>
                <option value="medium">🟠 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="modal-row">
              <input className="field-in" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{flex:1}}/>
              <input className="field-in" type="number" placeholder="Study hours target" min="0" value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} style={{flex:1}}/>
            </div>
            <button className="add-btn" onClick={submit}>Add Task</button>
          </div>
        </div>
        <div className="modal-section">
          <p className="modal-section-title">📋 Tasks ({subTasks.length})</p>
          {subTasks.length===0
            ?<p className="empty-msg" style={{padding:"12px 0"}}>No tasks yet for this subject.</p>
            :<div className="task-list">
              {subTasks.map(t=>(
                <div key={t.id} className={`task-item ${t.done?"done":""}`}>
                  <div className="task-left">
                    <span style={{fontSize:"16px"}}>{typeIcon[t.type]||"📝"}</span>
                    <div>
                      <p className="task-title">{t.title}</p>
                      <p className="task-meta">
                        {t.date&&<span>📅 {t.date}</span>}
                        {t.hours&&<span>⏱ {t.hours}h target</span>}
                        {t.date===todayStr&&!t.done&&<span className="due-badge">DUE TODAY</span>}
                      </p>
                    </div>
                  </div>
                  <button className="del-btn" onClick={()=>onDeleteTask(t.id)}>🗑</button>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  )
}

// ─── Timetable Tab ────────────────────────────────────────────────────────────

function TimetableTab({tasks,onAddTask,onDeleteTask,onSubjectsUpdate,subjects}){
  const email = localStorage.getItem("userEmail");
  const [rawText,setRawText]=useState("")
  const [showPaste,setShowPaste]=useState(false)
  const [courses,setCourses]=useState(()=>{try{return JSON.parse(localStorage.getItem(`tt_courses_${email}`)||"[]")}catch{return[]}})
  const [view,setView]=useState("grid")
  const [selected,setSelected]=useState(null)
  const [msg,setMsg]=useState("")

  useEffect(()=>{localStorage.setItem(`tt_courses_${email}`, JSON.stringify(courses))},[courses])

  function handleParse(){
    const parsed=parseVITText(rawText)
    if(parsed.length===0){setMsg("⚠️ No courses found. Paste the full timetable text from VTOP.");return}
    setCourses(parsed)
    // Auto-sync to Subjects tab via React state (not just localStorage)
    const existing = subjects || []
    const existCodes = new Set(existing.map(s=>s.code||"").filter(Boolean))
    const newSubs = parsed
      .filter(c => c.slots[0]!=="NIL" && !existCodes.has(c.code))
      .map(c => ({
        id: c.id,
        name: `${c.code} - ${c.name}`,
        code: c.code,
        color: c.color,
        fromTimetable: true,
      }))
    if(newSubs.length > 0 && onSubjectsUpdate){
      onSubjectsUpdate(prev => {
        const merged = [...prev, ...newSubs]
       localStorage.setItem(`subjects_${email}`, JSON.stringify(merged))
        return merged
      })
    }
    setMsg(`✅ Imported ${parsed.length} courses! ${newSubs.length} added to Subjects.`)
    setRawText("");setShowPaste(false)
  }

  // Build grid — resolveSlot returns array (theory slots span 2 days/week)
  const gridData={}
  DAYS.forEach(d=>gridData[d]=[])
  courses.forEach(course=>{
    (course.slots||[]).forEach(slot=>{
      const infos=resolveSlot(slot)
      infos.forEach(info=>{
        gridData[info.day].push({course,slot,time:info.time})
      })
    })
  })
  DAYS.forEach(d=>gridData[d].sort((a,b)=>a.time.localeCompare(b.time)))

  const todayIdx=new Date().getDay()
  const dayMap={1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"}
  const todayKey=dayMap[todayIdx]||null

  return(
    <div style={{maxWidth:"100%"}}>
      <div className="tt-header">
        <div>
          <h2 className="panel-title">Timetable</h2>
          <p style={{color:"#555",fontSize:"13px",marginTop:"4px"}}>
            {courses.length>0?`${courses.length} courses imported`:"Paste your VTOP timetable to auto-import"}
          </p>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {courses.length>0&&<>
            <button className={`view-btn ${view==="grid"?"active":""}`} onClick={()=>setView("grid")}>⊞ Grid</button>
            <button className={`view-btn ${view==="list"?"active":""}`} onClick={()=>setView("list")}>☰ List</button>
          </>}
          <button className="cgpa-btn-secondary" style={{fontSize:"12px",padding:"8px 14px"}} onClick={()=>{setShowPaste(!showPaste);setMsg("")}}>
            📋 {courses.length>0?"Re-import":"Import"} Timetable
          </button>
          {courses.length>0&&<button className="cgpa-btn-ghost" style={{fontSize:"12px",padding:"8px 12px"}}
            onClick={()=>{if(window.confirm("Clear all timetable data?")){setCourses([]);localStorage.removeItem(`tt_courses_${email}`)}}}>
            Clear
          </button>}
        </div>
      </div>

      {/* Paste panel */}
      {(showPaste||courses.length===0)&&(
        <div className="paste-box">
          <p className="paste-title">📋 Import from VTOP</p>
          <p className="paste-sub">Go to VTOP → Academics → Time Table → select all text on the page → paste below</p>
          <textarea className="paste-area" placeholder="Paste your full timetable text here..." value={rawText}
            onChange={e=>setRawText(e.target.value)} rows={10}/>
          <div style={{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
            <button className="cgpa-btn-primary" onClick={handleParse} disabled={!rawText.trim()}>Import Timetable</button>
            {showPaste&&<button className="cgpa-btn-ghost" onClick={()=>{setShowPaste(false);setRawText("")}}>Cancel</button>}
            {msg&&<span style={{fontSize:"13px",color:msg.startsWith("✅")?"#4ade80":"#f87171"}}>{msg}</span>}
          </div>
        </div>
      )}

      {courses.length>0&&!showPaste&&<>
        {/* Today banner */}
        {todayKey&&gridData[todayKey]?.length>0&&(
          <div className="today-banner">
            <span className="today-label">Today ({todayKey})</span>
            <div className="today-pills">
              {gridData[todayKey].map((item,i)=>(
                <div key={i} className="today-pill" style={{borderColor:item.course.color}} onClick={()=>setSelected(item.course)}>
                  <span style={{color:item.course.color,fontWeight:900,fontSize:"11px"}}>{item.course.code}</span>
                  <span style={{fontSize:"10px",color:"#888"}}>{item.time} · {item.course.venue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {view==="grid"&&(
          <div className="tt-grid-wrap">
            <div className="tt-grid">
              {DAYS.map(day=>(
                <div key={day} className="tt-col">
                  <div className={`tt-day-header ${todayKey===day?"today-col":""}`}>{day}</div>
                  <div className="tt-cells">
                    {gridData[day].length===0
                      ?<div className="tt-empty-day">Free</div>
                      :gridData[day].map((item,i)=>{
                        const tc=tasks.filter(t=>t.subjectId===item.course.id&&!t.done).length
                        return(
                          <div key={i} className="tt-cell" style={{borderLeft:`3px solid ${item.course.color}`}}
                            onClick={()=>setSelected(item.course)}>
                            <div className="tt-cell-slot">{item.slot}</div>
                            <div className="tt-cell-time">{item.time}</div>
                            <div className="tt-cell-name">{item.course.name.split(" ").slice(0,4).join(" ")}</div>
                            <div className="tt-cell-venue">{item.course.venue}</div>
                            {tc>0&&<div className="tt-task-dot">{tc}</div>}
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view==="list"&&(
          <div className="course-list">
            {courses.map(c=>{
              const cT=tasks.filter(t=>t.subjectId===c.id&&!t.done)
              return(
                <div key={c.id} className="course-card" style={{borderTop:`3px solid ${c.color}`}} onClick={()=>setSelected(c)}>
                  <div className="cc-left">
                    <div className="cc-code" style={{color:c.color}}>{c.code}</div>
                    <div className="cc-name">{c.name}</div>
                    <div className="cc-meta"><span>{c.type}</span><span>•</span><span>{c.credits} cr</span><span>•</span><span>{c.venue}</span><span>•</span><span>{c.faculty}</span></div>
                    <div className="cc-slots">{(c.slots||[]).map(s=><span key={s} className="cc-slot-chip">{s}</span>)}</div>
                  </div>
                  <div className="cc-right">
                    {cT.length>0&&<div className="cc-task-badge">{cT.length} pending</div>}
                    <span className="cc-arrow">›</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>}

      {selected&&<SubjectModal subject={selected} tasks={tasks} onAddTask={onAddTask} onDeleteTask={onDeleteTask} onClose={()=>setSelected(null)}/>}
    </div>
  )
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────
function CalendarTab({tasks}){
  const today=new Date()
  const [vd,setVd]=useState(new Date(today.getFullYear(),today.getMonth(),1))
  const yr=vd.getFullYear(),mo=vd.getMonth()
  const firstDay=new Date(yr,mo,1).getDay()
  const dim=new Date(yr,mo+1,0).getDate()
  const todayStr=today.toISOString().split("T")[0]
  const prv=()=>setVd(new Date(yr,mo-1,1))
  const nxt=()=>setVd(new Date(yr,mo+1,1))
  function tasksFor(d){
    const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
    return tasks.filter(t=>t.date===ds)
  }
  const cells=[]
  for(let i=0;i<(firstDay===0?6:firstDay-1);i++)cells.push(null)
  for(let d=1;d<=dim;d++)cells.push(d)
  return(
    <div style={{maxWidth:"900px"}}>
      <div className="cal-header">
        <button className="cal-nav" onClick={prv}>‹</button>
        <h2 className="panel-title" style={{margin:0}}>{vd.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</h2>
        <button className="cal-nav" onClick={nxt}>›</button>
      </div>
      <div className="cal-grid">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d,i)=>{
          if(!d)return<div key={`e${i}`} className="cal-cell empty"/>
          const dt=tasksFor(d)
          const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
          return(
            <div key={d} className={`cal-cell ${ds===todayStr?"cal-today":""} ${dt.some(t=>!t.done)?"cal-has-task":""}`}>
              <span className="cal-day-num">{d}</span>
              <div className="cal-task-pills">
                {dt.slice(0,3).map(t=>(
                  <div key={t.id} className={`cal-task-pill ${t.done?"done":""}`}>
                    <span>{t.title}</span>
                  </div>
                ))}
                {dt.length>3&&<div className="cal-more">+{dt.length-3} more</div>}
              </div>
            </div>
          )
        })}
      </div>
      {/* Upcoming deadlines */}
      <div style={{marginTop:"24px"}}>
        <h3 style={{color:"#fff",fontSize:"16px",fontWeight:900,marginBottom:"12px"}}>Upcoming Deadlines</h3>
        {tasks.filter(t=>!t.done&&t.date&&t.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10).map(t=>{
          const diff=Math.ceil((new Date(t.date)-today)/(1000*60*60*24))
          return(
            <div key={t.id} className="deadline-row">
              <div className="dl-dot" style={{background:diff===0?"#f87171":diff<=3?"orange":"#4ade80"}}/>
              <div className="dl-info">
                <span className="dl-title">{t.title}</span>
                <span className="dl-sub">{t.subjectName||t.subject||"General"}</span>
              </div>
              <div className="dl-date">
                <span style={{color:diff===0?"#f87171":diff<=3?"orange":"#888",fontWeight:900,fontSize:"12px"}}>
                  {diff===0?"TODAY":diff===1?"TOMORROW":`${diff}d`}
                </span>
                <span style={{fontSize:"11px",color:"#555"}}>{t.date}</span>
              </div>
            </div>
          )
        })}
        {tasks.filter(t=>!t.done&&t.date&&t.date>=todayStr).length===0&&
          <p className="empty-msg">No upcoming deadlines 🎉</p>}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard(){
  const navigate=useNavigate()
  const email=localStorage.getItem("userEmail")||"Student"
  const name=email.split("@")[0]
  const [activeTab,setActiveTab]=useState("timetable")
  const [tasks,setTasks]=useState(()=>{try{return JSON.parse(localStorage.getItem(`tasks_${email}`)||"[]")}catch{return[]}})
  const [newTask,setNewTask]=useState({title:"",subject:"",date:"",priority:"medium",type:"assignment"})
  const [subjects,setSubjectsState]=useState(()=>{try{return JSON.parse(localStorage.getItem(`subjects_${email}`)||"[]")}catch{return[]}})
  const [newSubject,setNewSubject]=useState("")
  const [notes, setNotes] = useState("");
  const [sidebarOpen,setSidebarOpen]=useState(true)

  useEffect(()=>{localStorage.setItem(`tasks_${email}`, JSON.stringify(tasks))},[tasks])
  useEffect(()=>{localStorage.setItem(`subjects_${email}`, JSON.stringify(subjects))},[subjects])
  useEffect(() => {
  const email = localStorage.getItem("userEmail");

  if (!email) return;

  fetch("https://study-forge-4.onrender.com/save-notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, notes })
  });
}, [notes]);

  // Browser notifications for due today
  useEffect(()=>{
    if(!("Notification"in window))return
    const request=()=>{
      if(Notification.permission==="default"){
        Notification.requestPermission().then(p=>{if(p==="granted")fireNotifs()})
      } else if(Notification.permission==="granted") fireNotifs()
    }
    function fireNotifs(){
      const todayStr=new Date().toISOString().split("T")[0]
      tasks.filter(t=>!t.done&&t.date===todayStr).forEach(t=>{
        new Notification(`📚 Due Today: ${t.title}`,{
          body:`${t.subjectName||t.subject||"Study task"} is due today!`,
          icon:"/favicon.ico",tag:String(t.id)
        })
      })
    }
    request()
  // eslint-disable-next-line
  },[])
  useEffect(() => {
  const email = localStorage.getItem("userEmail");

  if (!email) return;

  fetch("https://study-forge-4.onrender.com/login-notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      setNotes(data.notes || "");
    });
}, []);

  function logout(){localStorage.removeItem("email");navigate("/")}
  function addTask(task){setTasks(prev=>[...prev,task])}
  const TASK_TYPE_LABELS={"assignment":"Digital Assignment","quiz":"Quiz","project":"Project","exam":"Exam","lab":"Lab Record","study":"Study Target"}
  function addTaskSimple(){
    const taskType = newTask.type||"assignment"
    const taskTitle = newTask.title.trim() || TASK_TYPE_LABELS[taskType] || taskType
    if(!taskTitle)return
    setTasks(prev=>[...prev,{...newTask,title:taskTitle,id:Date.now(),done:false,type:taskType}])
    setNewTask({title:"",subject:"",date:"",priority:"medium",type:"assignment"})
  }
  function toggleTask(id){setTasks(tasks.map(t=>t.id===id?{...t,done:!t.done}:t))}
  function deleteTask(id){setTasks(tasks.filter(t=>t.id!==id))}
  function addSubjectItem(){
    if(!newSubject.trim())return
    setSubjectsState([...subjects,{id:Date.now(),name:newSubject,color:COLORS[subjects.length%COLORS.length]}])
    setNewSubject("")
  }
  function deleteSubject(id){setSubjectsState(subjects.filter(s=>s.id!==id))}

  const todayStr=new Date().toISOString().split("T")[0]
  const dueTodayCount=tasks.filter(t=>t.date===todayStr&&!t.done).length
  const pendingCount=tasks.filter(t=>!t.done).length
  const doneCount=tasks.filter(t=>t.done).length
  const pCol={high:"#f87171",medium:"orange",low:"#4ade80"}

  const tabs=[
    {id:"timetable",label:"Timetable",icon:"🗓"},
    {id:"calendar", label:"Calendar", icon:"📆"},
    {id:"tasks",    label:"Tasks",    icon:"✅"},
    {id:"cgpa",     label:"CGPA",     icon:"🎓"},
    {id:"subjects", label:"Subjects", icon:"📚"},
    {id:"notes",    label:"Notes",    icon:"📝"},
  ]

  return(
    <div className="dash-root">
      <aside className={`sidebar ${sidebarOpen?"open":"closed"}`}>
        <div className="sidebar-top">
          <div className="brand-pill" onClick={()=>setSidebarOpen(!sidebarOpen)}>SF</div>
          {sidebarOpen&&<span className="brand-name">StudyForge</span>}
          <button className="toggle-btn" onClick={()=>setSidebarOpen(!sidebarOpen)} title={sidebarOpen?"Collapse":"Expand"}>
            {sidebarOpen?"◀":"▶"}
          </button>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(t=>(
            <button key={t.id} className={`nav-item ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              {sidebarOpen&&<span className="nav-label">{t.label}</span>}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={logout}>
          <span>🚪</span>{sidebarOpen&&<span>Logout</span>}
        </button>
      </aside>

      <main className="dash-main">
        <div className="topbar">
          <div>
            <p className="greeting">{getGreeting()}, <span className="greeting-name">{name}</span> 👋</p>
            <p className="date-line">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>
          <div className="topbar-stats">
            <div className="mini-stat red"><span>{dueTodayCount}</span><small>Due today</small></div>
            <div className="mini-stat orange"><span>{pendingCount}</span><small>Pending</small></div>
            <div className="mini-stat green"><span>{doneCount}</span><small>Done</small></div>
          </div>
        </div>

        <div className="content-area">
          {activeTab==="timetable"&&<TimetableTab tasks={tasks} onAddTask={addTask} onDeleteTask={deleteTask} onSubjectsUpdate={setSubjectsState} subjects={subjects}/>}
          {activeTab==="calendar"&&<CalendarTab tasks={tasks}/>}
          {activeTab==="cgpa"&&<CGPACalculator/>}

          {activeTab==="tasks"&&(
            <div className="tab-panel">
              <h2 className="panel-title">Task Manager</h2>
              <div className="add-card">
                <div className="task-title-row">
                  <select className="field-select task-type-sel" value={newTask.type||"assignment"}
                    onChange={e=>setNewTask({...newTask,type:e.target.value})}>
                    <option value="assignment">📝 Digital Assignment</option>
                    <option value="quiz">❓ Quiz</option>
                    <option value="project">🛠 Project</option>
                    <option value="exam">📋 Exam</option>
                    <option value="lab">🧪 Lab Record</option>
                    <option value="study">📚 Study Target</option>
                  </select>
                  <input className="field-in" placeholder="Task title (optional custom)" value={newTask.title}
                    onChange={e=>setNewTask({...newTask,title:e.target.value})} style={{flex:1}}/>
                </div>
                <select className="field-select sub-sel" value={newTask.subject}
                  onChange={e=>setNewTask({...newTask,subject:e.target.value})}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s=>(
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  <option value="General">General</option>
                </select>
                <input className="field-in" type="date" value={newTask.date}
                  onChange={e=>setNewTask({...newTask,date:e.target.value})}/>
                <select className="field-select" value={newTask.priority}
                  onChange={e=>setNewTask({...newTask,priority:e.target.value})}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟠 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
                <button className="add-btn" onClick={addTaskSimple}>Add Task</button>
              </div>
              <div className="task-list">
                {tasks.length===0&&<p className="empty-msg">No tasks yet!</p>}
                {tasks.map(t=>(
                  <div key={t.id} className={`task-item ${t.done?"done":""}`}>
                    <div className="task-left">
                      <button className="check-btn" onClick={()=>toggleTask(t.id)}>{t.done?"✅":"⬜"}</button>
                      <div>
                        <p className="task-title">{t.title}</p>
                        <p className="task-meta">
                          {(t.subjectName||t.subject)&&<span>{t.subjectName||t.subject}</span>}
                          {t.date&&<span>📅 {t.date}</span>}
                          {t.priority&&<span style={{color:pCol[t.priority]}}>● {t.priority}</span>}
                          {t.date===todayStr&&!t.done&&<span className="due-badge">DUE TODAY</span>}
                        </p>
                      </div>
                    </div>
                    <button className="del-btn" onClick={()=>deleteTask(t.id)}>🗑</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="subjects"&&(
            <div className="tab-panel">
              <h2 className="panel-title">My Subjects</h2>
              <div className="add-card" style={{flexWrap:"nowrap"}}>
                <input className="field-in" placeholder="Subject name" value={newSubject}
                  onChange={e=>setNewSubject(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubjectItem()}/>
                <button className="add-btn" onClick={addSubjectItem}>Add</button>
              </div>
              <div className="subject-grid">
                {subjects.length===0&&<p className="empty-msg">No subjects yet.</p>}
                {subjects.map(s=>(
                  <div key={s.id} className="subject-card" style={{borderTop:`3px solid ${s.color}`}}>
                    <div className="sub-dot" style={{background:s.color}}/>
                    <span className="sub-card-name">{s.name}</span>
                    <button className="del-btn" onClick={()=>deleteSubject(s.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="notes"&&(
            <div className="tab-panel">
              <h2 className="panel-title">Quick Notes</h2>
              <textarea className="notes-area" placeholder="Jot down anything — formulas, reminders, ideas..."
                value={notes} onChange={e=>setNotes(e.target.value)}/>
              <p className="notes-hint">✓ Auto-saved to your browser</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{margin:0;padding:0;width:100%;height:100%;overflow:hidden}
        @keyframes bgShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .dash-root{display:flex;width:100vw;height:100vh;overflow:hidden;background:#080810;color:#fff;font-family:'Montserrat','Segoe UI',sans-serif;position:fixed;inset:0}
        .dash-root::before{content:'';position:fixed;inset:0;background:
          radial-gradient(ellipse 600px 500px at 10% 20%, rgba(251,146,60,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 500px 400px at 85% 75%, rgba(99,102,241,0.08) 0%, transparent 70%),
          radial-gradient(ellipse 400px 350px at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 300px 250px at 80% 10%, rgba(236,72,153,0.05) 0%, transparent 70%);
          pointer-events:none;z-index:0}
        .dash-root::after{content:'';position:fixed;inset:0;
          background-image:radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size:32px 32px;pointer-events:none;z-index:0}
        .sidebar{display:flex;flex-direction:column;background:rgba(12,12,18,0.95);backdrop-filter:blur(12px);border-right:1px solid rgba(255,255,255,0.06);transition:width 0.3s ease;height:100vh;overflow:hidden;flex-shrink:0;position:relative;z-index:2}
        .sidebar.open{width:220px}.sidebar.closed{width:64px}
        .sidebar-top{display:flex;align-items:center;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.06);min-height:64px;flex-shrink:0}
        .sidebar.closed .sidebar-top{justify-content:center}
        .sidebar.closed .toggle-btn{margin-left:0}
        .brand-pill{min-width:36px;height:36px;background:orange;color:#000;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0;cursor:pointer}
        .brand-name{font-weight:900;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden}
        .toggle-btn{margin-left:auto;background:#1a1a1a;border:1px solid #2e2e2e;border-radius:6px;color:#888;cursor:pointer;font-size:13px;padding:5px 9px;width:auto;margin-top:0;flex-shrink:0;transition:all 0.2s}
        .toggle-btn:hover{color:orange;border-color:orange;transform:none}
        .sidebar-nav{flex:1;display:flex;flex-direction:column;gap:4px;padding:12px 8px;overflow-y:auto}
        .nav-item{display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:none;border:none;color:#555;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;transition:all 0.2s;white-space:nowrap;width:100%;margin-top:0}
        .nav-item:hover{background:rgba(255,255,255,0.06);color:#ddd;transform:none}
        .nav-item.active{background:rgba(251,146,60,0.15);color:#fb923c;box-shadow:inset 3px 0 0 #fb923c}
        .nav-icon{font-size:16px;flex-shrink:0}
        .logout-btn{display:flex;align-items:center;gap:12px;margin:8px;padding:10px;background:none;border:1px solid #222;border-radius:10px;color:#555;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;transition:all 0.2s;white-space:nowrap;width:calc(100% - 16px);margin-top:0}
        .logout-btn:hover{border-color:#f87171;color:#f87171;transform:none}
        .dash-main{flex:1;display:flex;flex-direction:column;height:100vh;overflow-y:auto;min-width:0;position:relative;z-index:1}
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(8,8,16,0.6);backdrop-filter:blur(8px);flex-wrap:wrap;gap:12px;flex-shrink:0;position:sticky;top:0;z-index:10}
        .greeting{font-size:18px;font-weight:900;color:#fff}.greeting-name{color:orange}
        .date-line{font-size:12px;color:#555;margin-top:4px}
        .topbar-stats{display:flex;gap:10px;flex-wrap:wrap}
        .mini-stat{display:flex;flex-direction:column;align-items:center;background:#131313;border:1px solid #1e1e1e;border-radius:10px;padding:8px 14px;min-width:60px}
        .mini-stat span{font-size:18px;font-weight:900}.mini-stat small{font-size:10px;color:#555;margin-top:2px;white-space:nowrap}
        .mini-stat.red span{color:#f87171}.mini-stat.orange span{color:orange}.mini-stat.green span{color:#4ade80}
        .content-area{flex:1;padding:24px;min-height:0}
        .tab-panel-bg{position:relative}
        .tab-panel{max-width:900px}
        .panel-title{font-size:22px;font-weight:900;color:#fff;margin-bottom:20px}

        /* TIMETABLE */
        .tt-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:20px;flex-wrap:wrap}
        .view-btn{background:#161616;border:1.5px solid #2e2e2e;border-radius:8px;color:#888;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;padding:8px 14px;transition:all 0.2s;margin-top:0;width:auto}
        .view-btn.active{border-color:orange;color:orange;background:rgba(255,165,0,0.08)}
        .view-btn:hover{border-color:#555;color:#ccc;transform:none}
        .paste-box{background:rgba(251,146,60,0.03);border:1px dashed rgba(251,146,60,0.25);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px;margin-bottom:20px}
        .paste-title{font-size:16px;font-weight:900;color:#fff}.paste-sub{font-size:12px;color:#555}
        .paste-area{background:#0d0d0d;border:1.5px solid #222;border-radius:10px;color:#ccc;font-family:inherit;font-size:12px;padding:14px;resize:vertical;transition:border-color 0.2s;width:100%;margin:0}
        .paste-area:focus{outline:none;border-color:orange}
        .today-banner{display:flex;align-items:center;gap:12px;background:rgba(251,146,60,0.06);border:1px solid rgba(251,146,60,0.2);border-radius:12px;padding:12px 16px;margin-bottom:16px;flex-wrap:wrap}
        .today-label{font-size:11px;font-weight:900;color:orange;text-transform:uppercase;letter-spacing:1px;white-space:nowrap}
        .today-pills{display:flex;gap:8px;flex-wrap:wrap}
        .today-pill{display:flex;flex-direction:column;background:#0d0d0d;border:1px solid #2e2e2e;border-radius:8px;padding:6px 10px;cursor:pointer;transition:border-color 0.2s}
        .today-pill:hover{border-color:orange}
        .tt-grid-wrap{overflow-x:auto;padding-bottom:8px}
        .tt-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;min-width:680px}
        .tt-col{display:flex;flex-direction:column;gap:6px}
        .tt-day-header{text-align:center;font-size:12px;font-weight:900;color:#555;padding:8px;border-radius:8px;background:#111;letter-spacing:1px}
        .tt-day-header.today-col{background:rgba(255,165,0,0.1);color:orange}
        .tt-cells{display:flex;flex-direction:column;gap:6px}
        .tt-empty-day{text-align:center;font-size:11px;color:#2e2e2e;padding:20px 8px}
        .tt-cell{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 10px 10px 12px;cursor:pointer;transition:all 0.2s;position:relative;backdrop-filter:blur(4px)}
        .tt-cell:hover{border-color:rgba(251,146,60,0.45);background:rgba(251,146,60,0.05);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.4)}
        .tt-cell-slot{font-size:10px;font-weight:900;color:#555;letter-spacing:1px}
        .tt-cell-time{font-size:10px;color:#444;margin:2px 0}
        .tt-cell-name{font-size:11px;font-weight:700;color:#ccc;line-height:1.3;margin:4px 0 2px}
        .tt-cell-venue{font-size:10px;color:#444}
        .tt-task-dot{position:absolute;top:6px;right:8px;background:orange;color:#000;border-radius:10px;font-size:9px;font-weight:900;padding:1px 5px}
        .course-list{display:flex;flex-direction:column;gap:8px}
        .course-card{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;backdrop-filter:blur(4px)}
        .course-card:hover{border-color:rgba(251,146,60,0.4);background:rgba(251,146,60,0.04)}
        .cc-left{flex:1}
        .cc-code{font-size:11px;font-weight:900;letter-spacing:1px;margin-bottom:4px}
        .cc-name{font-size:14px;font-weight:700;color:#ddd;margin-bottom:4px}
        .cc-meta{display:flex;gap:6px;font-size:11px;color:#555;flex-wrap:wrap;margin-bottom:6px}
        .cc-slots{display:flex;gap:6px;flex-wrap:wrap}
        .cc-slot-chip{background:#1a1a1a;border:1px solid #2e2e2e;border-radius:4px;font-size:10px;color:#888;padding:2px 6px;font-weight:700}
        .cc-right{display:flex;align-items:center;gap:8px}
        .cc-task-badge{background:rgba(255,165,0,0.12);color:orange;border:1px solid rgba(255,165,0,0.3);border-radius:20px;font-size:11px;font-weight:700;padding:3px 10px}
        .cc-arrow{font-size:24px;color:#333}

        /* MODAL */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
        .modal-box{background:rgba(10,10,18,0.97);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.7)}
        .modal-header{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #1e1e1e;gap:12px}
        .modal-code{font-size:11px;font-weight:900;color:orange;letter-spacing:1px;margin-bottom:4px}
        .modal-name{font-size:17px;font-weight:900;color:#fff;margin-bottom:6px}
        .modal-meta{display:flex;gap:6px;font-size:11px;color:#555;flex-wrap:wrap}
        .modal-close{background:#1a1a1a;border:1px solid #2e2e2e;border-radius:8px;color:#888;cursor:pointer;font-size:14px;padding:6px 10px;width:auto;margin-top:0;flex-shrink:0;transition:all 0.2s}
        .modal-close:hover{color:#f87171;border-color:#f87171;transform:none}
        .modal-section{padding:16px 24px;border-bottom:1px solid #1a1a1a}
        .modal-section:last-child{border-bottom:none}
        .modal-section-title{font-size:11px;font-weight:900;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px}
        .slot-chips{display:flex;gap:8px;flex-wrap:wrap}
        .slot-chip{display:flex;flex-direction:column;background:#0d0d0d;border:1px solid #2e2e2e;border-radius:8px;padding:8px 12px}
        .slot-code{font-size:13px;font-weight:900;color:#fff}.slot-time{font-size:11px;color:#555;margin-top:2px}
        .slot-nil{font-size:13px;color:#555;font-style:italic}
        .modal-form{display:flex;flex-direction:column;gap:10px}
        .modal-row{display:flex;gap:10px}

        /* CALENDAR */
        .cal-header{display:flex;align-items:center;gap:16px;margin-bottom:20px}
        .cal-nav{background:#161616;border:1.5px solid #222;border-radius:8px;color:#fff;cursor:pointer;font-size:18px;padding:8px 14px;width:auto;margin-top:0;transition:all 0.2s}
        .cal-nav:hover{border-color:orange;color:orange;transform:none}
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
        .cal-dow{text-align:center;font-size:11px;font-weight:900;color:#555;padding:8px 0;letter-spacing:1px}
        .cal-cell{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:6px;min-height:72px;display:flex;flex-direction:column;gap:3px;transition:all 0.2s}
        .cal-cell.empty{background:transparent;border-color:transparent}
        .cal-cell:not(.empty):hover{border-color:rgba(251,146,60,0.35);background:rgba(251,146,60,0.04)}
        .cal-today{border-color:orange!important;background:rgba(255,165,0,0.06)}
        .cal-has-task{border-color:#2a2a2a}
        .cal-day-num{font-size:11px;font-weight:900;color:#777}
        .cal-today .cal-day-num{color:orange}
        .cal-task-pills{display:flex;flex-direction:column;gap:2px}
        .cal-task-pill{border:1px solid rgba(255,165,0,0.4);border-radius:3px;padding:2px 4px;font-size:9px;color:#ccc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:rgba(255,165,0,0.08)}
        .cal-task-pill.done{border-color:#2a2a2a;color:#555;background:#1a1a1a}
        .cal-more{font-size:9px;color:#555}
        .deadline-row{display:flex;align-items:center;gap:12px;background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:12px 14px;margin-bottom:8px}
        .dl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .dl-info{flex:1;display:flex;flex-direction:column;gap:2px}
        .dl-title{font-size:13px;font-weight:700;color:#ddd}
        .dl-sub{font-size:11px;color:#555}
        .dl-date{display:flex;flex-direction:column;align-items:flex-end;gap:2px}

        /* SHARED */
        .add-card{display:flex;gap:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;flex-wrap:wrap;margin-bottom:20px;align-items:center;backdrop-filter:blur(8px)}
        .task-title-row{display:flex;gap:10px;width:100%;align-items:center;flex-wrap:wrap}
        .task-type-sel{min-width:180px;flex-shrink:0}
        .sub-sel{min-width:200px}
        .field-in{flex:1;min-width:120px;background:#161616;border:1.5px solid #222;border-radius:8px;color:#fff;font-family:inherit;font-size:13px;padding:10px 12px;margin:0;width:auto;transition:border-color 0.2s}
        .field-in:focus{outline:none;border-color:orange}
        .field-select{background:#161616;border:1.5px solid #222;border-radius:8px;color:#fff;font-family:inherit;font-size:13px;padding:10px 12px;cursor:pointer}
        .field-select:focus{outline:none;border-color:orange}
        .add-btn{background:orange;border:none;border-radius:8px;color:#000;font-family:inherit;font-size:13px;font-weight:900;padding:10px 20px;cursor:pointer;white-space:nowrap;margin-top:0;width:auto;transition:all 0.2s}
        .add-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(255,165,0,0.3)}
        .task-list{display:flex;flex-direction:column;gap:8px}
        .task-item{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px 14px;transition:all 0.2s;backdrop-filter:blur(4px)}
        .task-item:hover{border-color:rgba(251,146,60,0.3);background:rgba(255,255,255,0.05)}
        .task-item.done{opacity:0.5}
        .task-left{display:flex;align-items:center;gap:10px}
        .check-btn{background:none;border:none;cursor:pointer;font-size:18px;padding:0;margin-top:0;width:auto}
        .check-btn:hover{transform:scale(1.2)}
        .task-title{font-size:14px;font-weight:700;color:#ddd}
        .task-item.done .task-title{text-decoration:line-through;color:#444}
        .task-meta{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;align-items:center}
        .task-meta span{font-size:11px;color:#555}
        .due-badge{background:rgba(248,113,113,0.15);color:#f87171!important;border:1px solid rgba(248,113,113,0.3);border-radius:4px;padding:1px 6px;font-weight:900!important}
        .del-btn{background:none;border:none;cursor:pointer;font-size:15px;color:#333;transition:color 0.2s;margin-top:0;width:auto;padding:4px}
        .del-btn:hover{color:#f87171;transform:none}
        .empty-msg{color:#333;font-size:14px;text-align:center;padding:32px 0}
        .subject-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
        .subject-card{display:flex;align-items:center;gap:10px;background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:14px;transition:border-color 0.2s}
        .subject-card:hover{border-color:#2a2a2a}
        .sub-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .sub-card-name{flex:1;font-size:13px;font-weight:700;color:#ccc}
        .notes-area{width:100%;min-height:400px;background:#111;border:1px solid #1e1e1e;border-radius:14px;color:#ccc;font-family:inherit;font-size:14px;line-height:1.8;padding:20px;resize:vertical;transition:border-color 0.2s;margin:0;display:block}
        .notes-area:focus{outline:none;border-color:orange}
        .notes-hint{font-size:11px;color:#333;margin-top:8px}

        /* CGPA */
        .cgpa-wrap{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
        .cgpa-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .cgpa-title{font-size:26px;font-weight:900;color:#fff}.cgpa-sub{font-size:13px;color:#555;margin-top:4px}
        .credit-badge{display:flex;flex-direction:column;align-items:center;background:#131313;border:1px solid #222;border-radius:12px;padding:12px 20px;flex-shrink:0}
        .credit-num{font-size:28px;font-weight:900}.credit-label{font-size:11px;color:#555;margin-top:2px}
        .grade-legend{display:flex;gap:8px;flex-wrap:wrap}
        .grade-chip{display:flex;flex-direction:column;align-items:center;background:#161616;border:1px solid #222;border-radius:8px;padding:8px 14px;min-width:48px}
        .grade-letter{font-size:15px;font-weight:900;color:orange}.grade-point{font-size:11px;color:#555;margin-top:2px}
        .subjects-list{display:flex;flex-direction:column;gap:10px}
        .subject-row{display:flex;align-items:center;gap:10px;background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:12px 14px}
        .sub-num{width:24px;height:24px;border-radius:6px;background:#1a1a1a;color:#555;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sub-input{background:#161616;border:1.5px solid #222;border-radius:8px;color:#fff;font-family:inherit;font-size:13px;padding:9px 12px;transition:border-color 0.2s;margin:0;width:auto}
        .sub-input:focus{outline:none;border-color:orange}
        .sub-name{flex:1}.sub-credits{width:90px}
        .sub-select{background:#161616;border:1.5px solid #222;border-radius:8px;color:#fff;font-family:inherit;font-size:13px;padding:9px 12px;cursor:pointer;width:110px;flex-shrink:0}
        .sub-select:focus{outline:none;border-color:orange}
        .sub-remove{background:none;border:1px solid #2e2e2e;border-radius:8px;color:#555;cursor:pointer;font-size:12px;padding:8px 10px;flex-shrink:0;width:auto;margin-top:0;transition:all 0.2s}
        .sub-remove:hover{border-color:#f87171;color:#f87171;transform:none}
        .cgpa-error{background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:10px;color:#f87171;font-size:13px;padding:10px 14px}
        .cgpa-actions{display:flex;gap:10px;flex-wrap:wrap}
        .cgpa-btn-primary{background:orange;border:none;border-radius:10px;color:#000;font-family:inherit;font-size:14px;font-weight:900;padding:12px 28px;cursor:pointer;transition:all 0.2s;margin-top:0;width:auto}
        .cgpa-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,165,0,0.35)}
        .cgpa-btn-primary:disabled{opacity:0.4;cursor:not-allowed}
        .cgpa-btn-secondary{background:#161616;border:1.5px solid #333;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;font-weight:700;padding:12px 20px;cursor:pointer;transition:all 0.2s;margin-top:0;width:auto}
        .cgpa-btn-secondary:hover:not(:disabled){border-color:orange;color:orange;transform:none}
        .cgpa-btn-secondary:disabled{opacity:0.4;cursor:not-allowed}
        .cgpa-btn-ghost{background:none;border:1px solid #222;border-radius:10px;color:#555;font-family:inherit;font-size:13px;padding:12px 16px;cursor:pointer;transition:all 0.2s;margin-top:0;width:auto}
        .cgpa-btn-ghost:hover{border-color:#444;color:#888;transform:none}
        .cgpa-result{position:relative;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;padding:28px}
        .result-glow{position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:200px;height:120px;border-radius:50%;filter:blur(50px);opacity:0.15;pointer-events:none}
        .result-inner{position:relative;z-index:1;text-align:center}
        .result-label{font-size:12px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
        .result-score{font-size:72px;font-weight:900;line-height:1;margin-bottom:8px}
        .result-badge{display:inline-block;background:#1a1a1a;border:1px solid #2e2e2e;border-radius:20px;padding:6px 18px;font-size:13px;color:#ccc;margin-bottom:12px}
        .result-formula{font-size:12px;color:#444;margin-bottom:20px;font-family:monospace}
        .result-breakdown{display:flex;flex-direction:column;gap:6px;border-top:1px solid #1e1e1e;padding-top:16px;text-align:left}
        .breakdown-row{display:flex;align-items:center;gap:12px;font-size:12px;color:#666}
        .br-name{flex:1;color:#888}.br-calc{font-family:monospace;color:#555}.br-grade{font-weight:900;font-size:13px;min-width:24px;text-align:right}

        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4);cursor:pointer}
        @media(max-width:640px){
          .sidebar.open{width:180px}.content-area{padding:16px}.topbar{padding:14px}
          .tt-grid{grid-template-columns:repeat(3,1fr)}.cal-grid{gap:2px}.cal-cell{min-height:60px;padding:4px}
        }
      `}</style>
    </div>
  )
}
