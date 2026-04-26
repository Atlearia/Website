"""Decimate Tree2.glb to ~5% of original face count using fast_simplification."""
import trimesh
import numpy as np
import fast_simplification
import sys, os

INPUT  = r"C:\Users\ronan\Desktop\ningye.ca\Main\Tree2.glb"
OUTPUT = r"C:\Users\ronan\Desktop\ningye.ca\Main\Website\Tree2_decimated.glb"
TARGET_RATIO = 0.95  # remove 95% of faces (keep 5%)

print(f"Loading {INPUT}...")
scene = trimesh.load(INPUT)

if isinstance(scene, trimesh.Scene):
    geometries = scene.geometry
    print(f"Scene has {len(geometries)} geometries")
    
    total_faces_before = 0
    total_faces_after = 0
    
    for name, mesh in geometries.items():
        if isinstance(mesh, trimesh.Trimesh):
            n_before = len(mesh.faces)
            total_faces_before += n_before
            
            try:
                # fast_simplification works with (vertices, faces) directly
                points_out, faces_out = fast_simplification.simplify(
                    mesh.vertices.astype(np.float32),
                    mesh.faces.astype(np.int32),
                    target_reduction=TARGET_RATIO
                )
                simplified = trimesh.Trimesh(vertices=points_out, faces=faces_out)
                
                # Transfer UV coords if possible by nearest-vertex mapping
                if mesh.visual and hasattr(mesh.visual, 'uv') and mesh.visual.uv is not None:
                    from scipy.spatial import cKDTree
                    tree = cKDTree(mesh.vertices)
                    _, idx = tree.query(points_out)
                    new_uv = mesh.visual.uv[idx]
                    simplified.visual = trimesh.visual.TextureVisual(uv=new_uv, material=mesh.visual.material)
                
                geometries[name] = simplified
                total_faces_after += len(simplified.faces)
                print(f"  {name}: {n_before:,} -> {len(simplified.faces):,} faces")
            except Exception as e:
                print(f"  {name}: Failed to simplify ({e}), keeping original")
                total_faces_after += n_before
    
    print(f"\nTotal: {total_faces_before:,} -> {total_faces_after:,} faces ({total_faces_after/total_faces_before*100:.1f}%)")
    
    print(f"Exporting to {OUTPUT}...")
    scene.export(OUTPUT, file_type='glb')
    
elif isinstance(scene, trimesh.Trimesh):
    n_before = len(scene.faces)
    print(f"Single mesh: {n_before:,} faces")
    
    points_out, faces_out = fast_simplification.simplify(
        scene.vertices.astype(np.float32),
        scene.faces.astype(np.int32),
        target_reduction=TARGET_RATIO
    )
    simplified = trimesh.Trimesh(vertices=points_out, faces=faces_out)
    print(f"Result: {len(simplified.faces):,} faces")
    simplified.export(OUTPUT, file_type='glb')

size_before = os.path.getsize(INPUT)
size_after = os.path.getsize(OUTPUT)
print(f"\nFile size: {size_before/1e6:.1f} MB -> {size_after/1e6:.1f} MB")
print("Done!")

size_before = os.path.getsize(INPUT)
size_after = os.path.getsize(OUTPUT)
print(f"\nFile size: {size_before/1e6:.1f} MB -> {size_after/1e6:.1f} MB")
print("Done!")
