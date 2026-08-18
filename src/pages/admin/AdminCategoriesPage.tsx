import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/supabase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { AcademicCategory } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [categories, setCategories] = useState<AcademicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AcademicCategory | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIconName('BookOpen');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: AcademicCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIconName(cat.iconName || 'BookOpen');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(
          editingCategory.id,
          {
            name,
            description,
            iconName,
          },
          currentAdmin
        );
      } else {
        await adminService.createCategory(
          {
            name,
            description,
            iconName,
            status: 'active',
          },
          currentAdmin
        );
      }
      await loadCategories();
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: AcademicCategory) => {
    const nextStatus = cat.status === 'inactive' ? 'active' : 'inactive';
    try {
      await adminService.updateCategory(cat.id, { status: nextStatus }, currentAdmin);
      await loadCategories();
    } catch (err) {
      console.error('Error toggling category status:', err);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await adminService.deleteCategory(id, currentAdmin);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <AdminLayout
      title="Academic Categories Manager"
      subtitle="Define, edit and structure the academic subject domains available for student project submission and assistant specialization"
      onRefresh={loadCategories}
      isRefreshing={loading}
    >
      {/* Top action header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Active Academic Domains ({categories.length})</h3>
          <p className="text-xs text-slate-500">Categories dictate student submission tags and assistant skill filtering</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No academic categories configured.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.status === 'inactive'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {cat.status === 'inactive' ? 'Inactive' : 'Active'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {cat.description || 'Specialized academic and project domain.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(cat)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    cat.status === 'inactive'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.status === 'inactive' ? 'Enable' : 'Disable'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingCategory ? 'Edit Academic Category' : 'Create New Academic Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Data Science & Machine Learning"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description & Scope</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of projects included in this domain..."
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
