# FinSync Pro - Verification Guide

## Setup Checklist

- [ ] Backend running at `http://localhost:8000`
- [ ] Frontend running at `http://localhost:5173`
- [ ] OpenAI API key set in `backend/.env`
- [ ] Tavily API key set (for web search features)

---

## Test Document

Create a simple test PDF with this content (or use any financial document):

**Sample content for test PDF (save as `test_policy.pdf`):**
```
FINANCIAL POLICY DOCUMENT
Company: ABC Financial Services
Policy ID: FP-2024-001

Section 1: Interest Rates
- Fixed Deposit Rate: 7.5% per annum
- Savings Account Rate: 4.0% per annum
- Current Repo Rate Reference: 6.5% (as of policy date)

Section 2: Investment Guidelines
- Minimum Investment: ₹10,000
- Lock-in Period: 12 months
- Penalty for early withdrawal: 1% of principal

Section 3: Tax Benefits
- Section 80C deduction applicable
- Maximum deduction: ₹1.5 lakh per year
- TDS applicable above ₹40,000 interest
```

---

## Test Queries by Feature

### 1. Document Upload & Indexing
| Action | Expected Result |
|--------|-----------------|
| Drag PDF to upload zone | Shows "Processing..." then "Ready" |
| Check sidebar | Document appears with chunk count |

---

### 2. Vector Store (Document Search)
These queries should use **📄 Docs** source:

| Query | Expected Behavior |
|-------|-------------------|
| "What is the fixed deposit rate in my policy?" | Returns 7.5%, cites test_policy.pdf |
| "Tell me about early withdrawal penalty" | Returns 1% penalty info |
| "What are the tax benefits mentioned in my documents?" | Returns Section 80C details |
| "Summarize my uploaded policy" | Summarizes key points from PDF |

---

### 3. Web Search (Tavily)
These queries should use **🌐 Web** source:

| Query | Expected Behavior |
|-------|-------------------|
| "What is the Nifty 50 index today?" | Live market data from web |
| "What is the current RBI repo rate?" | Current repo rate from news |
| "Latest inflation rate in India" | Recent economic news |
| "Today's gold price" | Live gold prices |

---

### 4. Hybrid Search (Both Sources)
These queries should use **BOTH** 🌐 Web and 📄 Docs:

| Query | Expected Behavior |
|-------|-------------------|
| "Compare the repo rate in my policy with the current RBI rate" | Uses both doc (6.5% reference) and web (current rate) |
| "Is my fixed deposit rate competitive compared to current market rates?" | Compares 7.5% from doc with live rates |
| "How do my tax benefits compare with latest budget announcements?" | Uses doc for policy, web for budget news |

---

### 5. Conversational Memory (5-turn context)
Test that context is maintained:

| Turn | Query | Expected |
|------|-------|----------|
| 1 | "What is the lock-in period in my policy?" | Returns 12 months |
| 2 | "What happens if I withdraw before that?" | Should understand "that" = lock-in period |
| 3 | "And the penalty amount?" | Should reference early withdrawal penalty |
| 4 | "Is this standard in the market?" | May search web for comparison |
| 5 | "Summarize what we discussed" | Should recall all 4 previous turns |

---

### 6. UI/UX Features

| Feature | How to Verify |
|---------|---------------|
| **Typewriter effect** | Watch AI response stream character by character |
| **Trace bar** | Check "Sources:" shows 🌐 Web or 📄 Docs badges |
| **Citation chips** | See numbered chips [1], [2] after response |
| **Citation drawer** | Click a chip → slide-out panel with source text |
| **Loading skeleton** | Shimmer effect while waiting for response |
| **Spring animations** | Chat input has subtle scale on focus |

---

### 7. Error Cases

| Scenario | Expected |
|----------|----------|
| Empty query | Send button disabled |
| No documents uploaded + doc query | Agent explains no docs found |
| Backend offline | Error message in chat |

---

## Quick Verification Script

Run these queries in order:

1. **Upload test PDF** → Verify sidebar shows document
2. `"What is the FD rate in my policy?"` → Should cite PDF
3. `"What is the current Sensex value?"` → Should use web search
4. `"Compare my policy rates to today's market"` → Should use both
5. `"What did I just ask about?"` → Should recall previous query

---

## API Verification (Optional)

Test the API directly:

```bash
# Health check
curl http://localhost:8000/api/health

# Chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Nifty 50 today?"}'

# List documents
curl http://localhost:8000/api/documents
```
