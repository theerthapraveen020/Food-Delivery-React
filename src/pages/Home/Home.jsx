import React, { useState,useRef } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/foodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'


const Home = () => {
const [category,setCategory]=useState("All");


  const menuRef = useRef(null)


  return (
    <div>
      <Header  menuRef={menuRef}/> 
      <ExploreMenu category={category} setCategory={setCategory} menuRef={menuRef}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
    </div>
  )
}

export default Home
