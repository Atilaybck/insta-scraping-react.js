// App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    sector: '',
  });
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchEditData, setSearchEditData] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    instagram: '',
    sector: '',
    isContracted: 'false',
    mailOpened: 'false',
    replied: 'false',
  });
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [checkedIndexes, setCheckedIndexes] = useState([]);
  const [trueCount, setTrueCount] = useState(0);
  const [falseCount, setFalseCount] = useState(0);

  useEffect(() => {
    fetchCustomers();
    fetchTotalCount();
    fetchContractedCounts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers?isContracted=false');
      setCustomers(response.data.slice(0, 5));
      setCheckedIndexes([]); 
    } catch (error) {
      console.error('Müşteri verileri alınırken hata oluştu:', error);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers/total');
      setTotalCount(response.data.total);
    } catch (error) {
      console.error('Toplam müşteri sayısı alınırken hata oluştu:', error);
    }
  };

  const fetchContractedCounts = async () => {
    try {
      const trueResponse = await axios.get('http://localhost:5000/api/customers/contracted?isContracted=true');
      const falseResponse = await axios.get('http://localhost:5000/api/customers/contracted?isContracted=false');
      setTrueCount(trueResponse.data.count);
      setFalseCount(falseResponse.data.count);
    } catch (error) {
      console.error('Contracted sayıları alınırken hata oluştu:', error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchResult(null);
    if (query.length === 0) {
      fetchCustomers();
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/search-customers', {
        params: { query },
      });
      const found = response.data[0] || null;
      setSearchResult(found);

      // Arama sonucu bulunduğunda, düzenleme alanına da yerleştir
      if (found) {
        setSearchEditData({
          _id: found._id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          instagram: found.instagram,
          sector: found.sector,
          isContracted: found.isContracted ? 'true' : 'false',
          mailOpened: found.mailOpened ? 'true' : 'false',
          replied: found.replied ? 'true' : 'false',
        });
      }
    } catch (error) {
      console.error('Arama sırasında hata oluştu:', error);
    }
  };

  const handleSearchFieldChange = (e) => {
    setSearchEditData({
      ...searchEditData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateSearchResult = async () => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${searchEditData._id}`, {
        name: searchEditData.name,
        email: searchEditData.email,
        phone: searchEditData.phone,
        instagram: searchEditData.instagram,
        sector: searchEditData.sector,
        isContracted: searchEditData.isContracted === 'true',
        mailOpened: searchEditData.mailOpened === 'true',
        replied: searchEditData.replied === 'true',
      });
  
      alert('Veriler güncellendi.');
      
      // Arama sonucu ve düzenleme formunu sıfırla
      setSearchResult(null);
      setSearchEditData({
        _id: '',
        name: '',
        email: '',
        phone: '',
        instagram: '',
        sector: '',
        isContracted: 'false',
        mailOpened: 'false',
        replied: 'false',
      });
  
      // Diğer listeleri ve sayıları güncelle
      fetchCustomers();
      fetchContractedCounts();
    } catch (error) {
      console.error('Güncelleme sırasında hata oluştu:', error);
      alert('Güncelleme yapılırken hata oluştu.');
    }
  };  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/instagram', formData);
      if (response.status === 201) {
        alert('Bilgiler başarıyla kaydedildi.');
        setFormData({ name: '', email: '', phone: '', instagram: '', sector: '' });
        fetchCustomers();
        fetchTotalCount();
        fetchContractedCounts();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.error);
      } else {
        setError('Bir hata oluştu.');
      }
    }
  };

  const handleCheckboxClick = async (customerId, index) => {
    if (window.confirm('Bu kişi ile iletişime geçildi mi?')) {
      try {
        await axios.put(`http://localhost:5000/api/customers/${customerId}`, { isContracted: true });
        alert('Kişi iletişime geçti olarak işaretlendi.');
        fetchCustomers();
        fetchContractedCounts();
      } catch (error) {
        console.error('Kişi güncellenirken hata oluştu:', error);
      }
    }
    setCheckedIndexes((prev) => [...prev, index]);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Instagram Bilgi Formu</h1>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <label>İsim Soyisim:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label>Telefon:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <label>Instagram Linki:</label>
          <input
            type="text"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            required
          />
          <label>Sektör:</label>
          <input
            type="text"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            required
          />
          <button type="submit">Kaydet</button>
        </form>

        <div>
          <label><strong>Arama:</strong></label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Arama yap..."
          />
        </div>

        {searchResult && (
          <div className="search-result">
            <h3>Arama Sonucu (Canlı Düzenleme):</h3>
            <label>İsim Soyisim:</label>
            <input
              type="text"
              name="name"
              value={searchEditData.name}
              onChange={handleSearchFieldChange}
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={searchEditData.email}
              onChange={handleSearchFieldChange}
            />
            <label>Telefon:</label>
            <input
              type="text"
              name="phone"
              value={searchEditData.phone}
              onChange={handleSearchFieldChange}
            />
            <label>Instagram Linki:</label>
            <input
              type="text"
              name="instagram"
              value={searchEditData.instagram}
              onChange={handleSearchFieldChange}
            />
            <label>Sektör:</label>
            <input
              type="text"
              name="sector"
              value={searchEditData.sector}
              onChange={handleSearchFieldChange}
            />

            <div>
              <label><strong>İletişim Durumu (isContracted):</strong></label>
              <select
                name="isContracted"
                value={searchEditData.isContracted}
                onChange={handleSearchFieldChange}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div>
              <label><strong>Mail Açıldı mı (mailOpened):</strong></label>
              <select
                name="mailOpened"
                value={searchEditData.mailOpened}
                onChange={handleSearchFieldChange}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div>
              <label><strong>Cevap Verildi mi (replied):</strong></label>
              <select
                name="replied"
                value={searchEditData.replied}
                onChange={handleSearchFieldChange}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <button onClick={handleUpdateSearchResult}>Güncelle</button>
          </div>
        )}
      </div>

      <div className="right-container">
        <h2>Son Eklenen Müşteriler</h2>
        <p><strong>İletişime Geçilenlerin Toplamı (isContracted: true):</strong> {trueCount}</p>
        <p><strong>İletişime Geçilmemişlerin Toplamı (isContracted: false):</strong> {falseCount}</p>
        {customers.map((customer, index) => (
          <div key={index} className="customer-card">
            <div>
              <input
                type="checkbox"
                id={`customer-checkbox-${index}`}
                onClick={() => handleCheckboxClick(customer._id, index)}
                checked={checkedIndexes.includes(index)}
              />
              <label htmlFor={`customer-checkbox-${index}`}>
                <p><strong>Ad:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Telefon:</strong> {customer.phone}</p>
                <p>
                  <strong>Instagram:</strong>{' '}
                  <a href={customer.instagram} target="_blank" rel="noopener noreferrer">
                    {customer.instagram}
                  </a>
                </p>
              </label>
            </div>
          </div>
        ))}

        <div className="total-count">
          <p><strong>Toplam Müşteri Sayısı:</strong> {totalCount}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
