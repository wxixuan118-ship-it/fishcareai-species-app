import type { SpeciesEnvironment } from '@/types/species'
import { formatHardness } from '@/lib/species-fields'

interface Props {
  env: SpeciesEnvironment
}

export default function WaterParamsTable({ env }: Props) {
  const hardness = formatHardness(env.hardness_dgh)
  return (
    <table className="ptbl">
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Ideal Range</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Temperature</td>
          <td>{env.temp_min_c}–{env.temp_max_c}°C ({Math.round(env.temp_min_c * 9/5 + 32)}–{Math.round(env.temp_max_c * 9/5 + 32)}°F)</td>
          <td>Use a reliable adjustable heater</td>
        </tr>
        <tr>
          <td>pH</td>
          <td>{env.ph_min}–{env.ph_max}</td>
          <td>Avoid sudden swings</td>
        </tr>
        {hardness && (
          <tr>
            <td>{hardness.isKh ? 'Hardness (KH)' : 'Hardness (GH)'}</td>
            <td>{hardness.value}</td>
            <td>{hardness.note}</td>
          </tr>
        )}
        <tr>
          <td>Ammonia</td>
          <td>{env.ammonia_ppm} ppm</td>
          <td>Any detectable ammonia signals a problem</td>
        </tr>
        <tr>
          <td>Nitrite</td>
          <td>{env.nitrite_ppm} ppm</td>
          <td>Toxic even at low levels</td>
        </tr>
        <tr>
          <td>Nitrate</td>
          <td>&lt;{env.nitrate_ppm_max} ppm</td>
          <td>Manage through regular partial water changes</td>
        </tr>
        <tr>
          <td>Min. tank</td>
          <td>{env.min_tank_liters}L ({Math.round(env.min_tank_liters * 0.264)} gal)</td>
          <td>Larger tanks are easier to keep stable</td>
        </tr>
      </tbody>
    </table>
  )
}
