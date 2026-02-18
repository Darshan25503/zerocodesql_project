import React from 'react';
import Footer from '@/components/Layout/Footer';
import Home from '@/components/Layout/Home';
import Navbar from '@/components/Layout/Navbar';
import { connectToDatabase } from '../lib/database/connection'
import { getDatabaseManager } from '@/lib/database/manager';
import { Authenticator } from '@/components/Auth/authenticator';


async function page() {
  // console.log((await getDatabaseManager()).databases);
  /*let tblRenders = [];
  for (const [tblName, tbl] of dbs[0].tables) {
    let results = await db.fetch(tbl, [...tbl.columns.values()], null, 10, 10);
    let tableRows = [];
    for (const row of results) {
      let tableRow = [];
      for (const col of tbl.columns.values()) {
        tableRow.push(<td>{row[col.name]}</td>);
      }
      tableRows.push(<tr>{...tableRow}</tr>);
    }
    let table = <table>
      <thead>
        <tr>
          {[...tbl.columns.values()].map(col => <th>{col.name}</th>)}
        </tr>
      </thead>
      <tbody>
        {...tableRows}
      </tbody>
    </table>
    tblRenders.push(<div>{table}</div>);
  }*/
  return (
    <div>
      {/*dbs[0].name*/}
      {/*...tblRenders*/}
      <Navbar />
      <div className="min-h-screen">
        <Home />
      </div>
      <Footer />
    </div>
  )
}

export default page
