import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import { Bar, Doughnut } from 'react-chartjs-2'
import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const API = 'http://127.0.0.1:5000/api'

// Transaction Interface
interface Transaction {
  _id: string
  transactionId: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  description: string
  createdAt: string
}

// Balance Interface
interface Balance {
  totalCredits: number
  totalDebits: number
  balance: number
}

// Analytics Interface
interface Analytics {
  totalCredits: number
  totalDebits: number
  balance: number
  totalTransactions: number
  monthly: {
    _id: string
    credits: number
    debits: number
    transactionCount: number
  }[]
}

function App() {

  const [token, setToken] = useState(
    localStorage.getItem('ledgerToken') || ''
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [balance, setBalance] = useState<Balance>({
    totalCredits: 0,
    totalDebits: 0,
    balance: 0
  })

  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [analytics, setAnalytics] = useState<Analytics>({
    totalCredits: 0,
    totalDebits: 0,
    balance: 0,
    totalTransactions: 0,
    monthly: []
  })

  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Analytics Date Filter States
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterLoading, setFilterLoading] = useState(false)

  // Login API
  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()

    setError('')
    setLoading(true)

    try {

      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (!data.token) {
        throw new Error('Authentication token not received')
      }

      localStorage.setItem('ledgerToken', data.token)

      setToken(data.token)
      setPassword('')
      setMessage('Login successful!')

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Login failed')

    } finally {

      setLoading(false)

    }
  }

  // Fetch Dashboard and Analytics Data
  const loadDashboard = async () => {

    try {

      const headers = {
        Authorization: `Bearer ${token}`
      }

      const [
        balanceResponse,
        transactionResponse,
        analyticsResponse
      ] = await Promise.all([

        fetch(`${API}/ledger/balance`, { headers }),

        fetch(`${API}/ledger/transactions`, { headers }),

        fetch(`${API}/ledger/analytics`, { headers })

      ])

      const balanceData = await balanceResponse.json()
      const transactionData = await transactionResponse.json()
      const analyticsData = await analyticsResponse.json()

      if (
        !balanceResponse.ok ||
        !transactionResponse.ok ||
        !analyticsResponse.ok
      ) {

        throw new Error(
          balanceData.message ||
          transactionData.message ||
          analyticsData.message ||
          'Unable to load dashboard'
        )

      }

      setBalance(balanceData.balance)

      setTransactions(transactionData.transactions)

      setAnalytics(analyticsData.analytics)

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Dashboard loading failed'
      )

    }
  }

  // Load Dashboard when user logs in
  useEffect(() => {

    if (token) {
      loadDashboard()
    }

  }, [token])

  // Create CREDIT or DEBIT Transaction
  const handleTransaction = async (e: React.FormEvent) => {

    e.preventDefault()

    setError('')
    setMessage('')

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {

      setError('Enter a valid positive amount')
      return

    }

    if (!description.trim()) {

      setError('Enter transaction description')
      return

    }

    setLoading(true)

    try {

      const response = await fetch(
        `${API}/ledger/${type.toLowerCase()}`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-event-id': `evt_${crypto.randomUUID()}`
          },

          body: JSON.stringify({
            amount: numericAmount,
            description: description.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(data.message || 'Transaction failed')

      }

      setMessage(`${type} transaction completed successfully!`)

      setAmount('')
      setDescription('')

      // Refresh Balance, Transactions and Analytics
      await loadDashboard()

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Transaction failed'
      )

    } finally {

      setLoading(false)

    }
  }

  // Apply Analytics Date Filter
  const applyDateFilter = async () => {

    setError('')
    setMessage('')

    if (!startDate || !endDate) {

      setError('Please select both start and end dates')
      return

    }

    if (startDate > endDate) {

      setError('Start date cannot be after end date')
      return

    }

    setFilterLoading(true)

    try {

      const response = await fetch(
        `${API}/ledger/analytics?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(data.message || 'Failed to fetch analytics')

      }

      setAnalytics(data.analytics)

      setMessage('Analytics filtered successfully!')

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Analytics filtering failed'
      )

    } finally {

      setFilterLoading(false)

    }
  }

  // Reset Analytics Date Filter
  const resetDateFilter = async () => {

    setStartDate('')
    setEndDate('')

    setError('')
    setMessage('')

    await loadDashboard()

  }

  // Monthly Bar Chart Data
  const monthlyChartData = {

    labels: analytics.monthly.map((item) => item._id),

    datasets: [

      {
        label: 'Credits',

        data: analytics.monthly.map((item) => item.credits),

        backgroundColor: 'rgba(34, 197, 94, 0.75)',

        borderRadius: 6
      },

      {
        label: 'Debits',

        data: analytics.monthly.map((item) => item.debits),

        backgroundColor: 'rgba(239, 68, 68, 0.75)',

        borderRadius: 6
      }

    ]

  }

  // Doughnut Chart Data
  const doughnutChartData = {

    labels: ['Credits', 'Debits'],

    datasets: [

      {
        data: [
          analytics.totalCredits,
          analytics.totalDebits
        ],

        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],

        borderWidth: 1
      }

    ]

  }

  // Chart Options
  const barChartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        position: 'top' as const
      },

      title: {
        display: true,
        text: 'Monthly Credit vs Debit'
      }

    }

  }

  const doughnutChartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        position: 'bottom' as const
      },

      title: {
        display: true,
        text: 'Credit and Debit Distribution'
      }

    }

  }

  // Logout
  const handleLogout = () => {

    localStorage.removeItem('ledgerToken')

    setToken('')

    setTransactions([])

    setBalance({
      totalCredits: 0,
      totalDebits: 0,
      balance: 0
    })

    setAnalytics({
      totalCredits: 0,
      totalDebits: 0,
      balance: 0,
      totalTransactions: 0,
      monthly: []
    })

    setStartDate('')
    setEndDate('')

    setMessage('')
    setError('')

  }

  // Login Screen
  if (!token) {

    return (

      <div className="app-container">

        <div className="login-card">

          <h1>LedgerGuard</h1>

          <p className="subtitle">
            Secure Multi-Tenant Billing Platform
          </p>

          <h2>Welcome Back</h2>

          <p className="description">
            Login to access your dashboard
          </p>

          {error && (
            <p className="dashboard-error">{error}</p>
          )}

          <form onSubmit={handleLogin}>

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>

          <p className="register">
            Secure LedgerGuard Login
          </p>

        </div>

      </div>

    )

  }

  // Dashboard Screen
  return (

    <div className="dashboard-container">

      <header className="dashboard-header">

        <div>

          <h1>LedgerGuard</h1>

          <p>Secure Multi-Tenant Billing Platform</p>

        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="dashboard-content">

        <div className="dashboard-welcome">

          <h2>Welcome to your Dashboard</h2>

          <p>
            Manage your financial transactions securely.
          </p>

        </div>

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* Balance Cards */}
        <div className="balance-cards">

          <div className="balance-card total">

            <h3>Available Balance</h3>

            <h2>
              ₹{balance.balance.toLocaleString('en-IN')}
            </h2>

          </div>

          <div className="balance-card credit">

            <h3>Total Credits</h3>

            <h2>
              ₹{balance.totalCredits.toLocaleString('en-IN')}
            </h2>

          </div>

          <div className="balance-card debit">

            <h3>Total Debits</h3>

            <h2>
              ₹{balance.totalDebits.toLocaleString('en-IN')}
            </h2>

          </div>

        </div>

        {/* Analytics Summary */}
        <section className="transaction-section">

          <h2>Financial Analytics</h2>

          {/* Analytics Date Range Filter */}
          <div className="analytics-filter">

            <div className="filter-field">

              <label htmlFor="startDate">Start Date</label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

            </div>

            <div className="filter-field">

              <label htmlFor="endDate">End Date</label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />

            </div>

            <button
              type="button"
              onClick={applyDateFilter}
              disabled={filterLoading}
            >
              {filterLoading ? 'Applying...' : 'Apply Filter'}
            </button>

            <button
              type="button"
              onClick={resetDateFilter}
              disabled={filterLoading}
            >
              Reset
            </button>

          </div>

          <div className="balance-cards">

            <div className="balance-card total">

              <h3>Total Transactions</h3>

              <h2>
                {analytics.totalTransactions}
              </h2>

            </div>

            <div className="balance-card credit">

              <h3>Analytics Credits</h3>

              <h2>
                ₹{analytics.totalCredits.toLocaleString('en-IN')}
              </h2>

            </div>

            <div className="balance-card debit">

              <h3>Analytics Debits</h3>

              <h2>
                ₹{analytics.totalDebits.toLocaleString('en-IN')}
              </h2>

            </div>

          </div>

        </section>

        {/* Analytics Charts */}
        <section className="transaction-section">

          <h2>Transaction Analytics Dashboard</h2>

          <div className="analytics-grid">

            {/* Monthly Bar Chart */}
            <div className="analytics-card">

              <h3>Monthly Financial Statistics</h3>

              {analytics.monthly.length > 0 ? (

                <div style={{ height: '320px' }}>

                  <Bar
                    data={monthlyChartData}
                    options={barChartOptions}
                  />

                </div>

              ) : (

                <p>No monthly analytics data available.</p>

              )}

            </div>

            {/* Doughnut Chart */}
            <div className="analytics-card">

              <h3>Credit and Debit Distribution</h3>

              {(analytics.totalCredits > 0 ||
                analytics.totalDebits > 0) ? (

                <div style={{ height: '320px' }}>

                  <Doughnut
                    data={doughnutChartData}
                    options={doughnutChartOptions}
                  />

                </div>

              ) : (

                <p>No transaction data available.</p>

              )}

            </div>

          </div>

        </section>

        {/* Transaction Form */}
        <section className="transaction-section">

          <h2>Manage Transactions</h2>

          <div className="transaction-actions">

            <button
              className="credit-button"
              onClick={() => setType('CREDIT')}
            >
              Add Credit
            </button>

            <button
              className="debit-button"
              onClick={() => setType('DEBIT')}
            >
              Add Debit
            </button>

          </div>

          <h3>{type} Transaction</h3>

          <form
            className="transaction-form"
            onSubmit={handleTransaction}
          >

            <input
              type="number"
              placeholder="Enter Amount"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Transaction Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? 'Processing...'
                : `Submit ${type}`}
            </button>

          </form>

        </section>

        {/* Transaction History */}
        <section className="transaction-section">

          <h2>Transaction History</h2>

          <div className="transaction-table-container">

            <table className="transaction-table">

              <thead>

                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>

              </thead>

              <tbody>

                {transactions.length === 0 ? (

                  <tr>
                    <td colSpan={5}>
                      No transactions found
                    </td>
                  </tr>

                ) : (

                  transactions.map((transaction) => (

                    <tr key={transaction._id}>

                      <td>
                        {transaction.transactionId}
                      </td>

                      <td
                        className={
                          transaction.type === 'CREDIT'
                            ? 'credit-text'
                            : 'debit-text'
                        }
                      >
                        {transaction.type}
                      </td>

                      <td>
                        ₹{transaction.amount.toLocaleString('en-IN')}
                      </td>

                      <td>
                        {transaction.description}
                      </td>

                      <td>
                        {new Date(
                          transaction.createdAt
                        ).toLocaleDateString('en-IN')}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>

  )

}

export default App