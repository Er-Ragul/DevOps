import React, { useRef, useEffect, useState } from 'react'
import 'bulma/css/bulma.min.css'
import './Landing.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faSearch, faPlay, faTrash, faPencil, faCheck, faXmark, faL } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

//let ENDPOINT = '192.168.209.129'
let ENDPOINT = '192.168.0.213:3002'

export default function Landing() {

  let clickRef = useRef(null)
  let [media, setMedia] = useState([])
  let [edit, setEdit] = useState({
    name: '',
    hide: true
  })
  let [player, setPlayer] = useState({
    play: false,
    uid: null
  })
  
  useEffect(() => {
    readData()
  }, [])

  /* To handle file upload */
  async function handleFileChange(event){
    let file = event.target.files[0]
    
    const formData = new FormData()

    formData.append('file', file);
    formData.append('data', JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type
    }))

    try {
      const response = await axios.post(`http://${ENDPOINT}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
            const total = event.total;
            const loaded = event.loaded;
            const percentage = Math.round((loaded / total) * 100);
            console.log(`Uploaded: ${percentage}%`);
        }
      });
      console.log(response.data);
      readData()
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  } 

  /* To get list of data */
  async function readData(){
    try{
      let response = await axios.get(`http://${ENDPOINT}/read`)
      setMedia(response.data)
    }
    catch(err){
      console.log('Unable to get data: ', err);
    }
  }

  /* To delete data */
  async function deleteData(uid){
    try{
      let response = await axios.post(`http://${ENDPOINT}/delete`, {uid: uid.toString()})
      console.log(response.data);
      readData()
    }
    catch(err){
      console.log('Something went wrong: ', err);
    }
  }

  /* To rename the data */
  async function renameData(item) {
    try{
      let response = await axios.post(`http://${ENDPOINT}/update`, {uid: item.uid.toString(), name: edit.name})
      console.log(response.data);
      readData()
    }
    catch(err){
      console.log('Something went wrong: ', err);
    }
    setEdit(old => ({...old, hide: !edit.hide}))
  }

  return (
    <div className="app">
      <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="#">
            <button className="button is-primary" onClick={() => clickRef.current.click()}>
              <span className="icon">
                <FontAwesomeIcon icon={faUpload} />
              </span>
              <span>Upload</span>
            </button>
            <input
                type="file"
                onChange={handleFileChange}
                ref={clickRef}
                style={{ display: 'none' }}
            />
          </a>
        </div>

        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="field has-addons">
                <div className="control">
                  <input className="input is-info" type="text" placeholder="Search" />
                </div>
                <div className="control">
                  <button className="button is-info is-size-5">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero is-primary is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Welcome to StreamFlix</h1>
            <h2 className="subtitle">Your favorite movies and shows, all in one place</h2>
          </div>
        </div>
      </section>

      {
        player.play ?
        <section style={{ position: 'relative' }}>
          <button className="button close-button is-danger is-light" onClick={() => setPlayer({play: false, uid: null})}>
            <span className="icon mr-1">
              <FontAwesomeIcon icon={faXmark} />
            </span>
            Close
          </button>
          <video controls autoPlay={true} width="100%">
            <source src={`http://${ENDPOINT}/player?id=${player.uid}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </section>:null
      }

      <section className="section">
        <div className="container">
          {/* <h2 className="title is-4">Trending Now</h2> */}
          <div className="columns is-multiline">
            {
              media.map((item, i) => (
                <div key={item} className="column is-2-desktop is-3-tablet is-6-mobile">
                  <div className="card">
                    <div className="card-image" onClick={() => setPlayer({play: !player.play, uid: item.uid})}>
                      <figure className="image is-3by4 has-play-button">
                        <img src={`https://picsum.photos/300/400?random=${i}`} alt="Placeholder image" />
                        <div className="play-button-overlay">
                          <span className="icon is-large">
                            <FontAwesomeIcon icon={faPlay} size="2x" />
                          </span>
                        </div>
                      </figure>
                    </div>
                    <div className="card-content">
                      <div className="content">
                        <p className={`title has-text-centered is-6 ${!edit.hide ? 'is-hidden' : !edit.hide}`}>{item.name}</p>
                        <div className={`${edit.hide ? 'is-hidden' : 'is-flex my-2'}`}>
                          <input className="input is-small is-info" type="text" placeholder="Rename" value={edit.name} onChange={(e) => setEdit(old => ({...old, name: e.target.value}))}/>
                          <button className="button is-info mx-2" onClick={(e) => renameData(item)}>
                            <FontAwesomeIcon icon={faCheck} size="1x" />
                          </button>
                        </div>
                        <div className="is-flex is-justify-content-space-around">
                          {/*
                          <button className="button" onClick={() => setPlayer({play: !player.play, uid: item.uid})}>
                            <span class="icon">
                              <FontAwesomeIcon icon={faPlay} size="1x" />
                            </span>
                          </button>
                          */}
                          <button className="button" onClick={(e) => setEdit({name: item.name, hide: !edit.hide})}>
                            <span class="icon">
                              <FontAwesomeIcon icon={faPencil} size="1x" />
                            </span>
                          </button>
                          <button className="button" onClick={() => deleteData(item.uid)}>
                            <span class="icon">
                              <FontAwesomeIcon icon={faTrash} size="1x" />
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>
    </div>
  )
}