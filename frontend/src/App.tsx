import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
        .then(res => res.json())
        .then(data => setProducts(data))
  }, [])

  return (
      <div>
        <h1>Danh sách điện thoại từ:</h1>
        <ul>
          {products.map((p, index) => <li key={index}>{p}</li>)}
        </ul>
      </div>
  )
}

export default App