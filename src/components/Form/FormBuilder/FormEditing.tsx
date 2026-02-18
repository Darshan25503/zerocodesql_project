"use client"
import Spinner from '@/components/Layout/Spinner';
import { AsyncReturnType } from '@/lib/database/types';
import { Id } from '@/lib/manage/types';
import React, { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';
import { FaLink } from 'react-icons/fa';
import { PiDotsSixVerticalBold } from "react-icons/pi";

interface FormEditViewState {
  id: Id<"Form">;
  title: string;
  name: string;
  shareString: string;
  columns: {
    id: number;
    databaseId: number;
    tableId: number;
    name: string;
    display: string;
    type: string;
    value: string;
    visible: boolean;
  }[];
}

interface LinkCardProps {
  form: FormEditViewState // Grab the form schema such as its fields from here
}

const FormEditing: React.FC<LinkCardProps> = (props: LinkCardProps) => {
  let urlShareString = `${window.location.origin}/shareform/${props.form.shareString}`;
  //const [formState, setFormState] = useState(props.form);
  const [columns, setColumns] = useState(props.form.columns);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(props.form.title);

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const dragRow = columns[dragIndex];
    const updatedColumns = [...columns];
    updatedColumns.splice(dragIndex, 1);
    updatedColumns.splice(hoverIndex, 0, dragRow);
    setColumns(updatedColumns);
  };

  const setColumnValue = (index: number, kind: string, value: string | boolean) => {
    if (kind === "value") {
      const updatedColumns = [...columns];
      updatedColumns[index].value = value as string;
      setColumns(updatedColumns);
    }
    if (kind === "visible") {
      const updatedColumns = [...columns];
      updatedColumns[index].visible = value as boolean;
      setColumns(updatedColumns);
    }
  }

  const handleSubmitForm = async () => {
    setLoading(true);
    await fetch('/api/form/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form: props.form.id,
        title: title,
        fields: columns.map(x => {
          return {
            database: x.databaseId,
            table: x.tableId,
            column: x.id,
            valueOrDescription: x.value,
            visible: x.visible,
          }
        })
      }),
    })
    setLoading(false);
  }

  return (<>
    <Toaster
      position="top-center"
      reverseOrder={false}
    />
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 max-h-[90vh]">
        <h1 className="text-xl font-bold mb-4">Share Form</h1>
        <div className="flex items-center border p-2 rounded-3xl shadow-md space-x-2 m-2 hover:bg-gray-100 cursor-pointer">
          <FaLink className="text-green-700 mr-2 ml-2" />
          <a href={urlShareString} target="_blank" rel="noopener noreferrer" className="text-blue-600">
            {urlShareString}
          </a>
        </div>
        <h1 className="text-xl font-bold mb-4">Form Editor</h1>
        <fieldset className="mb-[12px] flex items-center gap-5">
          <label className="text-black w-[90px] text-right text-[15px]" htmlFor="databaseName">
            Title
          </label>
          <input
            className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </fieldset>
        <table className="table w-full">
          <thead>
            <tr className='bg-slate-700 text-white '>
              <th></th>
              <th>#</th>
              <th>Show</th>
              <th>Column</th>
              <th>Question/Default</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, index) => (
              <DraggableRow
                key={col.id}
                index={index}
                id={col.id}
                moveRow={moveRow}
                data={col}
                updateRow={(kind, v) => setColumnValue(index, kind, v)}
              />
            ))}
          </tbody>
        </table>
        <div className="mt-[20px] flex justify-end">
          <button className="btn btn-primary"
            onClick={handleSubmitForm}>
            {loading ? <Spinner /> : <>Submit</>}
          </button>
        </div>
      </div>
    </DndProvider></>
  );
};

interface DraggableRowProps {
  id: number;
  index: number;
  data: FormEditViewState["columns"][number];
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  updateRow: (kind: string, value: string | boolean) => void;
}

const DraggableRow: React.FC<DraggableRowProps> = ({ id, index, data, moveRow, updateRow }) => {
  const dragRef = React.useRef<HTMLTableCellElement>(null);
  const dropRef = React.useRef<HTMLTableRowElement>(null);
  const [, drop] = useDrop({
    accept: 'row',
    hover(item: { index: number }) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: 'row',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(dropRef)
  drag(dragRef);

  return (
    <tr ref={dropRef} className={`${isDragging ? 'opacity-50' : ''} bg-slate-200`}>
      <td ref={dragRef} className='bold cursor-pointer'><PiDotsSixVerticalBold /></td>
      <td>{index + 1}</td>
      <td>
        <input className='checkbox' type="checkbox" checked={data.visible} onChange={e => updateRow('visible', e.target.checked)} />
      </td>
      <td>{data.display}</td>
      <td>
        <input type="text" className='input' value={data.value} onChange={e => updateRow('value', e.target.value)}></input>
      </td>
    </tr>
  );
};

export default FormEditing;
