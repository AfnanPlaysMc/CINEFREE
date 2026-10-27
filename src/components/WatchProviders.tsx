/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, Tv } from 'lucide-react';
import { TMDBWatchProvidersResponse, WatchProviderItem } from '../lib/tmdb-types';
import { getImageUrl } from '../lib/utils';

interface WatchProvidersProps {
  providersData: TMDBWatchProvidersResponse | null;
  title: string;
}

export const WatchProviders: React.FC<WatchProvidersProps> = ({ providersData, title }) => {
  const results = providersData?.results || {};
  const countryCodes = Object.keys(results);

  // Default to US or first available country
  const defaultCountry = countryCodes.includes('US') ? 'US' : countryCodes[0] || '';
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const countryInfo = selectedCountry ? results[selectedCountry] : null;

  if (!countryInfo || (!countryInfo.flatrate && !countryInfo.free && !countryInfo.rent && !countryInfo.buy)) {
    return (
      <div className="p-5 rounded-xl bg-[#141419] border border-white/5 my-6">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <Tv className="w-5 h-5 text-zinc-500" />
          <span>No digital streaming providers currently registered in this territory for {title}.</span>
        </div>
      </div>
    );
  }

  const renderProviderGroup = (label: string, items?: WatchProviderItem[], badgeColor = 'bg-blue-600/20 text-blue-400 border-blue-500/30') => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2">
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}>
          {label}
        </span>
        <div className="flex flex-wrap gap-2.5">
          {items.map((prov) => (
            <div
              key={prov.provider_id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1c1c24] border border-white/5 shadow-sm"
              title={prov.provider_name}
            >
              <img
                src={getImageUrl(prov.logo_path, 'w300')}
                alt={prov.provider_name}
                className="w-6 h-6 rounded object-cover shadow"
              />
              <span className="text-xs font-medium text-white">{prov.provider_name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-[#141419] border border-white/10 my-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Authorized Streaming & Availability</h4>
            <p className="text-xs text-zinc-400">Official streaming and digital distribution partners</p>
          </div>
        </div>

        {countryCodes.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="country-select" className="text-xs text-zinc-400">
              Region:
            </label>
            <select
              id="country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-[#1c1c24] border border-white/10 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              {countryCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderProviderGroup('Stream (Subscription)', countryInfo.flatrate, 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')}
        {renderProviderGroup('Free / Ad-Supported', countryInfo.free || countryInfo.ads, 'bg-purple-500/20 text-purple-400 border-purple-500/30')}
        {renderProviderGroup('Rent Online', countryInfo.rent, 'bg-amber-500/20 text-amber-400 border-amber-500/30')}
        {renderProviderGroup('Buy Digital', countryInfo.buy, 'bg-blue-500/20 text-blue-400 border-blue-500/30')}
      </div>

      {countryInfo.link && (
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-400">
          <span>Data provided via JustWatch / TMDB</span>
          <a
            href={countryInfo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Check Complete Regional Offers <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
