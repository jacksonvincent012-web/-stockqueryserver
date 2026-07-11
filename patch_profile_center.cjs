const fs = require('fs');
let code = fs.readFileSync('src/components/user/ProfileAccountCenter.tsx', 'utf8');

const regex = /const handlePhotoUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\}\s*\};/;

const replacement = `const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Unsupported format. Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB.');
      return;
    }

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const minSize = Math.min(img.width, img.height);
      canvas.width = minSize;
      canvas.height = minSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const xOffset = (img.width - minSize) / 2;
      const yOffset = (img.height - minSize) / 2;
      ctx.drawImage(img, xOffset, yOffset, minSize, minSize, 0, 0, minSize, minSize);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoURL(dataUrl);
      updateProfile({ photoURL: dataUrl });
      showToast('Profile picture uploaded and updated successfully.');
    } catch (err) {
      showToast('Failed to process image');
    }
  };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/user/ProfileAccountCenter.tsx', code);
