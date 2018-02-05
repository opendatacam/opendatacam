import React, { Component } from 'react'

class MenuCountingAreasEditor extends Component {

  render () {
    return (
      <div className="menu-active-areas">
        <a href="02.02-delete-drawings.html">
          <div className="delete button">
            <img className="icon" src="/static/icons/icon-delete.svg" />
          </div>
        </a>
        <div className="new-color yellow button">

        </div>
        <div className="new-color turquoise button">

        </div>
        <div className="plus button">
          <img className="icon" src="/static/icons/icon-plus.svg" />
        </div>
        <style jsx>{`
          .menu-active-areas{
            height: 3rem;
            display: flex;
            position: fixed;
            top: 1.5rem;
            left: 1.5rem;
          }
      
          .menu-active-areas .button{
            width: 2.5rem;
            height: 2.5rem;
            margin-right: 1.5rem;
            border: 5px solid transparent;
            transition: 100ms;
            display: flex;
            justify-content: center;
            align-items: center;
          }
      
          .menu-active-areas .delete{
            background-color: white;
          }
          .menu-active-areas .delete:hover{
            border: 5px solid #D6D6D6;
          }
          .menu-active-areas .yellow {
            background-color: #FFE700;
          }
          .menu-active-areas .yellow:hover {
            border: 5px solid #C7B400;
          }
          .menu-active-areas .turquoise {
            background-color: #A3FFF4;
          }
          .menu-active-areas .turquoise:hover {
            border: 5px solid #01EACE;
          }
        `}</style>
      </div>
    )
  }
}

export default MenuCountingAreasEditor
