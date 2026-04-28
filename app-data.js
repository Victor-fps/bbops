// BusinessBuild Ops — Sample Data

const WORKSPACES = [
  {
    id: 'wholesale',
    name: 'Flores RE Wholesale',
    abbr: 'FW',
    color: '#d4a017',
    areas: [
      {
        id: 'acquisitions', name: 'Acquisitions',
        projects: [
          {
            id: 'lead-intake', name: 'Lead Intake & Qualification System', status: 'active', progress: 50,
            startDate: '2026-03-15', endDate: '2026-05-30',
            tasks: [
              { id: 't1', title: 'Build lead intake form (motivated seller)', status: 'done', priority: 'high', due: '2026-03-25', notes: 'Cover property address, situation, timeline, condition' },
              { id: 't2', title: 'Create lead scoring rubric (equity, motivation, condition)', status: 'done', priority: 'high', due: '2026-04-05', notes: '' },
              { id: 't3', title: 'Document appointment-setting script', status: 'in-progress', priority: 'high', due: '2026-04-28', notes: 'Walkthroughs + virtual appointments' },
              { id: 't4', title: 'Build follow-up sequence for cold leads', status: 'in-progress', priority: 'medium', due: '2026-05-05', notes: '6-touch sequence over 30 days' },
              { id: 't5', title: 'Set up CRM pipeline stages for acquisition', status: 'todo', priority: 'high', due: '2026-05-15', notes: '' },
              { id: 't6', title: 'Create offer presentation SOP', status: 'todo', priority: 'medium', due: '2026-05-25', notes: '' },
            ]
          },
          {
            id: 'underwriting', name: 'Underwriting & Offer Process', status: 'active', progress: 30,
            startDate: '2026-04-01', endDate: '2026-06-15',
            tasks: [
              { id: 't7', title: 'Build ARV comp pull SOP (MLS + Propstream)', status: 'in-progress', priority: 'high', due: '2026-04-28', notes: '' },
              { id: 't8', title: 'Create repair estimate worksheet', status: 'todo', priority: 'high', due: '2026-05-08', notes: 'Tiered: light / medium / heavy rehab' },
              { id: 't9', title: 'Document MAO formula and decision logic', status: 'todo', priority: 'high', due: '2026-05-15', notes: 'MAO = (ARV × 0.70) − repairs − assignment fee' },
              { id: 't10', title: 'Build offer letter templates (multiple scenarios)', status: 'todo', priority: 'medium', due: '2026-05-28', notes: '' },
              { id: 't11', title: 'Create contract-to-close checklist', status: 'todo', priority: 'medium', due: '2026-06-10', notes: '' },
            ]
          },
        ]
      },
      {
        id: 'disposition', name: 'Disposition',
        projects: [
          {
            id: 'buyers-list', name: "Buyer's List Build-out", status: 'active', progress: 40,
            startDate: '2026-03-20', endDate: '2026-06-01',
            tasks: [
              { id: 't12', title: 'Create buyer intake form (criteria, proof of funds)', status: 'done', priority: 'high', due: '2026-03-28', notes: '' },
              { id: 't13', title: 'Build buyer segment tags (fix & flip, BRRRR, landlord)', status: 'done', priority: 'medium', due: '2026-04-08', notes: '' },
              { id: 't14', title: 'Set up buyer blast email template', status: 'in-progress', priority: 'high', due: '2026-04-27', notes: 'Include: address, ARV, asking price, photos, repair estimate' },
              { id: 't15', title: 'Create dispo call script', status: 'todo', priority: 'high', due: '2026-05-05', notes: '' },
              { id: 't16', title: 'Document assignment contract process', status: 'todo', priority: 'high', due: '2026-05-18', notes: '' },
              { id: 't17', title: 'Build earnest money & closing coordination SOP', status: 'todo', priority: 'medium', due: '2026-05-28', notes: '' },
            ]
          },
          {
            id: 'deal-marketing', name: 'Deal Marketing System', status: 'planned', progress: 0,
            startDate: '2026-05-15', endDate: '2026-07-15',
            tasks: [
              { id: 't18', title: 'Create deal one-pager template', status: 'todo', priority: 'high', due: '2026-05-22', notes: 'Photos, numbers, neighborhood comps' },
              { id: 't19', title: 'Set up private deal blast list (email + SMS)', status: 'todo', priority: 'high', due: '2026-06-01', notes: '' },
              { id: 't20', title: 'Build urgency framework for buyer outreach', status: 'todo', priority: 'medium', due: '2026-06-15', notes: '' },
            ]
          },
        ]
      },
      {
        id: 'marketing', name: 'Seller Marketing',
        projects: [
          {
            id: 'inbound', name: 'Inbound Marketing System', status: 'active', progress: 25,
            startDate: '2026-04-10', endDate: '2026-07-01',
            tasks: [
              { id: 't21', title: 'Build motivated seller landing page', status: 'in-progress', priority: 'high', due: '2026-04-30', notes: 'We buy houses fast — cash offer' },
              { id: 't22', title: 'Set up Google Ads campaign for cash offers', status: 'todo', priority: 'high', due: '2026-05-10', notes: '' },
              { id: 't23', title: 'Create Facebook / Instagram ads for sellers', status: 'todo', priority: 'medium', due: '2026-05-20', notes: '' },
              { id: 't24', title: 'Build SEO content plan for local market', status: 'todo', priority: 'low', due: '2026-06-15', notes: '' },
            ]
          },
          {
            id: 'outbound', name: 'Outbound Marketing System', status: 'active', progress: 60,
            startDate: '2026-03-01', endDate: '2026-05-15',
            tasks: [
              { id: 't25', title: 'Finalize direct mail list criteria (absentee + equity)', status: 'done', priority: 'high', due: '2026-03-15', notes: '' },
              { id: 't26', title: 'Design and send first direct mail batch', status: 'done', priority: 'high', due: '2026-04-01', notes: '500 postcards, yellow letters' },
              { id: 't27', title: 'Set up cold SMS campaign (BatchLeads)', status: 'in-progress', priority: 'high', due: '2026-04-28', notes: '' },
              { id: 't28', title: 'Build cold calling list + dialer setup', status: 'todo', priority: 'medium', due: '2026-05-10', notes: '' },
            ]
          },
        ]
      },
      {
        id: 'ops', name: 'Operations & Finance',
        projects: [
          {
            id: 'sop-library', name: 'SOP Library', status: 'active', progress: 35,
            startDate: '2026-04-01', endDate: '2026-06-30',
            tasks: [
              { id: 't29', title: 'Document end-to-end deal flow (lead to close)', status: 'in-progress', priority: 'high', due: '2026-04-30', notes: '' },
              { id: 't30', title: 'Create title company coordination checklist', status: 'todo', priority: 'high', due: '2026-05-15', notes: '' },
              { id: 't31', title: 'Build hiring SOP for acquisitions VA', status: 'todo', priority: 'medium', due: '2026-05-28', notes: '' },
              { id: 't32', title: 'Document earnest money handling process', status: 'todo', priority: 'high', due: '2026-06-10', notes: '' },
            ]
          },
          {
            id: 'financials', name: 'Financial Tracking System', status: 'active', progress: 70,
            startDate: '2026-03-01', endDate: '2026-05-01',
            tasks: [
              { id: 't33', title: 'Build deal profit tracker (assignment fee per deal)', status: 'done', priority: 'high', due: '2026-03-20', notes: '' },
              { id: 't34', title: 'Create monthly marketing spend vs. deal ROI report', status: 'done', priority: 'high', due: '2026-04-01', notes: '' },
              { id: 't35', title: 'Automate monthly P&L summary', status: 'in-progress', priority: 'high', due: '2026-04-25', notes: '' },
              { id: 't36', title: 'Set up deal pipeline revenue forecast', status: 'todo', priority: 'medium', due: '2026-04-30', notes: '' },
            ]
          },
        ]
      },
    ]
  },
  {
    id: 'agency',
    name: 'Automate Pro Agency',
    abbr: 'AP',
    color: '#6366f1',
    areas: [
      {
        id: 'internal', name: 'Internal Systems',
        projects: [
          {
            id: 'onboard', name: 'Client Onboarding Flow', status: 'active', progress: 45,
            startDate: '2026-04-01', endDate: '2026-05-31',
            tasks: [
              { id: 'a1', title: 'Design intake questionnaire', status: 'done', priority: 'high', due: '2026-04-08', notes: '' },
              { id: 'a2', title: 'Build welcome sequence (email automation)', status: 'in-progress', priority: 'high', due: '2026-04-25', notes: 'Using ActiveCampaign' },
              { id: 'a3', title: 'Create client portal setup SOP', status: 'todo', priority: 'medium', due: '2026-05-10', notes: '' },
              { id: 'a4', title: 'Build kickoff call template & agenda', status: 'todo', priority: 'medium', due: '2026-05-20', notes: '' },
            ]
          },
          {
            id: 'delivery', name: 'Service Delivery Automation', status: 'active', progress: 25,
            startDate: '2026-04-15', endDate: '2026-07-15',
            tasks: [
              { id: 'a5', title: 'Map current delivery workflow', status: 'in-progress', priority: 'high', due: '2026-04-28', notes: '' },
              { id: 'a6', title: 'Build project status update automation', status: 'todo', priority: 'high', due: '2026-05-15', notes: '' },
              { id: 'a7', title: 'Create deliverable review checklist', status: 'todo', priority: 'medium', due: '2026-06-01', notes: '' },
            ]
          },
        ]
      },
      {
        id: 'clientwork', name: 'Client Systems',
        projects: [
          {
            id: 'proposals', name: 'Discovery & Proposal Templates', status: 'active', progress: 60,
            startDate: '2026-03-20', endDate: '2026-05-01',
            tasks: [
              { id: 'a8', title: 'Write discovery call script', status: 'done', priority: 'high', due: '2026-04-01', notes: '' },
              { id: 'a9', title: 'Build ROI calculator for proposals', status: 'done', priority: 'high', due: '2026-04-10', notes: '' },
              { id: 'a10', title: 'Design proposal template (doc)', status: 'in-progress', priority: 'high', due: '2026-04-27', notes: '' },
              { id: 'a11', title: 'Create pricing packages doc', status: 'todo', priority: 'medium', due: '2026-04-30', notes: '' },
            ]
          },
        ]
      },
      {
        id: 'marketing', name: 'Marketing & Brand',
        projects: [
          {
            id: 'brand', name: 'Website & Brand Identity', status: 'planned', progress: 0,
            startDate: '2026-06-01', endDate: '2026-08-01',
            tasks: [
              { id: 'a12', title: 'Define brand voice & positioning', status: 'todo', priority: 'high', due: '2026-06-10', notes: '' },
              { id: 'a13', title: 'Wireframe website structure', status: 'todo', priority: 'medium', due: '2026-06-20', notes: '' },
              { id: 'a14', title: 'Write website copy', status: 'todo', priority: 'medium', due: '2026-07-10', notes: '' },
            ]
          },
          {
            id: 'leadgen', name: 'Lead Gen System', status: 'planned', progress: 0,
            startDate: '2026-07-01', endDate: '2026-09-01',
            tasks: [
              { id: 'a15', title: 'Choose primary lead gen channel', status: 'todo', priority: 'high', due: '2026-07-08', notes: '' },
              { id: 'a16', title: 'Build lead magnet / freebie', status: 'todo', priority: 'medium', due: '2026-07-25', notes: '' },
              { id: 'a17', title: 'Set up lead capture automation', status: 'todo', priority: 'medium', due: '2026-08-15', notes: '' },
            ]
          },
        ]
      },
    ]
  }
];

window.APP_DATA = { WORKSPACES };
