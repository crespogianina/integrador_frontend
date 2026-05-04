//   <section className="mx-auto max-w-6xl space-y-6">
//     <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//       <div>
//         <h1 className="text-3xl font-bold text-slate-800">
//           Gestión de insumos
//         </h1>
//         <p className="text-sm text-slate-500">
//           Administra el stock, precios y estado de los insumos.
//         </p>
//       </div>
//     </div>

//     <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
//       <section className="rounded-2xl bg-white p-5 shadow">
//         <h2 className="mb-4 text-xl font-semibold text-slate-800">
//           {editandoId ? "Editar insumo" : "Nuevo insumo"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="mb-1 block text-sm font-medium text-slate-700">
//               Nombre
//             </label>
//             <input
//               name="nombre"
//               value={form.nombre}
//               onChange={handleChange}
//               placeholder="Ej: Harina"
//               className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-medium text-slate-700">
//               Categoría
//             </label>
//             <input
//               name="categoria"
//               value={form.categoria}
//               onChange={handleChange}
//               placeholder="Ej: Panadería"
//               className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 Stock
//               </label>
//               <input
//                 name="stock"
//                 type="number"
//                 value={form.stock}
//                 onChange={handleChange}
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-slate-700">
//                 Unidad
//               </label>
//               <input
//                 name="unidad"
//                 value={form.unidad}
//                 onChange={handleChange}
//                 placeholder="kg, l, unidad"
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-medium text-slate-700">
//               Precio
//             </label>
//             <input
//               name="precio"
//               type="number"
//               value={form.precio}
//               onChange={handleChange}
//               className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-sm font-medium text-slate-700">
//               Estado
//             </label>
//             <select
//               name="estado"
//               value={form.estado}
//               onChange={handleChange}
//               className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//             >
//               <option value="Activo">Activo</option>
//               <option value="Inactivo">Inactivo</option>
//             </select>
//           </div>

//           <div className="flex gap-3">
//             <button
//               type="submit"
//               className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
//             >
//               {editandoId ? "Guardar cambios" : "Agregar"}
//             </button>

//             {editandoId && (
//               <button
//                 type="button"
//                 onClick={limpiarFormulario}
//                 className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
//               >
//                 Cancelar
//               </button>
//             )}
//           </div>
//         </form>
//       </section>
